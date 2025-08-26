import { setPlaybackMode } from "@/resources/audioAdapter";
import { getLocalSample } from "@/resources/audioSamples";
import { getTopicById, Subtopic } from "@/resources/topics";
import { Audio } from "expo-av";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function VoiceTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = getTopicById(id);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  async function togglePlay(sub: Subtopic) {
    try {
      if (playingId === sub.id) {
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await soundRef.current.pauseAsync();
            setPlayingId(null);
            return;
          }
        }
      }
      // stop previous
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        setPlayingId(null);
      }
      try {
        await setPlaybackMode();
      } catch {}
      await new Promise((r) => setTimeout(r, 50));
      // Use placeholder beep (generate a short silent file or use remote). For now just skip if no audioUri.
      const localAsset = getLocalSample((sub as any).audioLocalIndex);
      if (localAsset) {
        const { sound } = await Audio.Sound.createAsync(localAsset);
        soundRef.current = sound;
        await sound.playAsync();
        setPlayingId(sub.id);
        sound.setOnPlaybackStatusUpdate((st) => {
          if (!st.isLoaded) return;
          if (st.didJustFinish) {
            setPlayingId(null);
            soundRef.current?.unloadAsync().catch(() => {});
            soundRef.current = null;
          }
        });
        return;
      }
      if (!sub.audioUri) return; // fallback remote
      const { sound } = await Audio.Sound.createAsync({ uri: sub.audioUri });
      soundRef.current = sound;
      await sound.playAsync();
      setPlayingId(sub.id);
      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setPlayingId(null);
          soundRef.current?.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  if (!topic) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Topic not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: topic.label, headerBackTitle: "" }} />
      <FlatList
        contentContainerStyle={{ padding: 20, gap: 12 }}
        data={topic.subtopics}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subTitle}>{item.title}</Text>
              {item.durationSeconds && (
                <Text style={styles.duration}>{item.durationSeconds}s</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.playBtn, playingId === item.id && styles.playing]}
              onPress={() => togglePlay(item)}
            >
              <Text style={styles.playText}>
                {playingId === item.id ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F6FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { fontSize: 16, color: "#555" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  subTitle: { fontSize: 14, fontWeight: "600", color: "#222" },
  duration: { marginTop: 4, fontSize: 11, color: "#666" },
  playBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playing: { backgroundColor: "#DC2626" },
  playText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
