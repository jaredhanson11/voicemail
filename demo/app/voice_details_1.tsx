import { setPlaybackMode } from "@/resources/audioAdapter";
import { getAudio } from "@/resources/audioSamples";
import { theme } from "@/resources/styles";
import { getTopicById, Subtopic } from "@/resources/topics";
import { Audio } from "expo-av";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Temporary mocked categories (adapt or fetch later)
const CATEGORIES = [
  {
    id: "encouragement",
    label: "Words of\nEncouragement",
    color: "#FDBA8C",
    icon: "✨",
  },
  { id: "comfort", label: "Comfort &\nSupport", color: "#FDD9E5", icon: "💛" },
  {
    id: "success",
    label: "Celebrating\nSuccess",
    color: "#FFE28C",
    icon: "🎉",
  },
  { id: "wisdom", label: "Life\nWisdom", color: "#D9C5FF", icon: "🧠" },
  { id: "reminders", label: "Daily\nReminders", color: "#B9E4FF", icon: "⏰" },
  // Additional demo-only categories (no real subtopics yet)
  { id: "daily_boost", label: "Daily\nBoost", color: "#FFE4C7", icon: "⚡️" },
  {
    id: "morning_start",
    label: "Morning\nStart",
    color: "#FFEED1",
    icon: "🌅",
  },
  {
    id: "evening_wind",
    label: "Evening\nWind-Down",
    color: "#E9E8FF",
    icon: "🌙",
  },
  {
    id: "calm_relax",
    label: "Calm &\nRelaxation",
    color: "#D9F5EE",
    icon: "🧘‍♂️",
  },
  { id: "affirmations", label: "Affirmations", color: "#FFE3F2", icon: "💬" },
  { id: "humor_light", label: "Humor &\nLight", color: "#FFF6CC", icon: "😄" },
  { id: "family_mem", label: "Family\nMemories", color: "#F4E8D9", icon: "📸" },
  { id: "gratitude", label: "Gratitude\nNotes", color: "#E4F8E8", icon: "🙏" },
  { id: "mindful", label: "Mindful\nMoments", color: "#E1F0FF", icon: "🧠" },
  {
    id: "practical_tips",
    label: "Practical\nTips",
    color: "#E8E6FF",
    icon: "🛠️",
  },
];

export default function VoiceDetailsScreen() {
  const containerBg =
    typeof theme.backgroundColor === "string"
      ? { backgroundColor: theme.backgroundColor }
      : theme.backgroundColor;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const toggleCategory = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  async function togglePlay(sub: Subtopic) {
    try {
      // pause currently playing if same
      if (playingId === sub.id && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPlayingId(null);
          return;
        }
      }
      // stop previous
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        setPlayingId(null);
      }
      // Ensure speaker playback mode (especially after recording screen)
      try {
        await setPlaybackMode();
      } catch {}
      // short delay can help some iOS devices switch route fully
      await new Promise((r) => setTimeout(r, 50));
      const localAsset = getAudio(sub.title);
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
      if (!sub.audioUri) return;
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

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  return (
    <View style={[styles.root, containerBg]}>
      <Stack.Screen options={{ title: "", headerBackTitle: "" }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <Image
            // Replace the file below with the provided avatar image placed at assets/images/voice_details_avatar.png
            source={require("@/assets/images/voice_details_avatar.png")}
            style={styles.avatar}
          />
          <View style={styles.nameWrap}>
            <Text style={styles.namePrimary}>Grandma</Text>
            <Text style={styles.nameSecondary}>Rose</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Library</Text>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            const topic = isExpanded ? getTopicById(item.id) : null; // existing ones resolve; new ones will be null
            return (
              <View style={styles.categoryBlock}>
                <TouchableOpacity
                  style={[styles.tile, { backgroundColor: "#fff" }]}
                  activeOpacity={0.85}
                  onPress={() => toggleCategory(item.id)}
                >
                  <View
                    style={[styles.iconBadge, { backgroundColor: item.color }]}
                  >
                    <Text style={styles.iconText}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tileLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                {isExpanded &&
                  (topic ? (
                    <View style={styles.subtopicsWrap}>
                      {topic.subtopics.map((sub) => {
                        const playing = playingId === sub.id;
                        return (
                          <View key={sub.id} style={styles.subRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.subTitle}>{sub.title}</Text>
                              {sub.durationSeconds && (
                                <Text style={styles.duration}>
                                  {sub.durationSeconds}s
                                </Text>
                              )}
                            </View>
                            <TouchableOpacity
                              style={[
                                styles.playBtn,
                                playing && styles.playing,
                              ]}
                              onPress={() => togglePlay(sub)}
                            >
                              <Text style={styles.playText}>
                                {playing ? "Pause" : "Play"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.subtopicsWrap}>
                      <Text style={styles.placeholder}>
                        Content coming soon
                      </Text>
                    </View>
                  ))}
              </View>
            );
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  nameWrap: { marginLeft: 16 },
  namePrimary: { fontSize: 28, fontWeight: "700", color: "#111" },
  nameSecondary: {
    fontSize: 28,
    fontWeight: "400",
    marginTop: -4,
    color: "#111",
  },
  sectionTitle: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  categoryBlock: { width: "100%" },
  tile: {
    width: "100%",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconText: { fontSize: 22 },
  tileLabel: { fontSize: 15, fontWeight: "600", lineHeight: 20, color: "#222" },
  chevron: { fontSize: 14, color: "#555", marginLeft: 8 },
  subtopicsWrap: {
    marginTop: 10,
    backgroundColor: "#F5F7FF",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  subTitle: { flex: 1, fontSize: 13, fontWeight: "500", color: "#222" },
  duration: { marginTop: 2, fontSize: 11, color: "#666" },
  playBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  playing: { backgroundColor: "#DC2626" },
  playText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  placeholder: {
    fontSize: 12,
    color: "#556",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
});
