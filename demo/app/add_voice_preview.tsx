import { setPlaybackMode } from "@/resources/audioAdapter";
import { Audio } from "expo-av";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// This screen fakes stitching the recorded clips and lets user preview before finalizing.
// It expects URIs passed via query params as a JSON string array "clips" & a name param.

export default function AddVoicePreview() {
  const { name, clips } = useLocalSearchParams<{
    name?: string;
    clips?: string;
  }>();
  const parsed: string[] = React.useMemo(() => {
    if (!clips) return [];
    try {
      return JSON.parse(String(clips));
    } catch {
      return [];
    }
  }, [clips]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true); // fake model generation time
  const [happy, setHappy] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  async function playAll() {
    if (playing) {
      try {
        await soundRef.current?.stopAsync();
      } catch {}
      try {
        await soundRef.current?.unloadAsync();
      } catch {}
      soundRef.current = null;
      setPlaying(false);
      return;
    }
    if (!parsed.length) return;
    setLoading(true);
    try {
      await setPlaybackMode();
      // For demo: just load first clip (no real concatenation) – could be improved by concatenating via native module.
      const { sound } = await Audio.Sound.createAsync({ uri: parsed[0] });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setPlaying(false);
          soundRef.current?.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
      setPlaying(true);
      await sound.playAsync();
    } catch (e) {
      console.warn("preview play error", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1800); // simulate 1.8s generation
    return () => {
      clearTimeout(t);
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Preview Voice", headerBackTitle: "" }} />
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <Text style={styles.heading}>Voice Created</Text>
        <Text style={styles.subtitle}>
          We&apos;ve generated a draft voice clone. Preview it below. If you
          like it, add it to your list; if not, you can go back and re‑record.
        </Text>
        {generating && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.loadingText}>Generating preview snippet…</Text>
          </View>
        )}
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Preview Snippet</Text>
          {parsed.length ? (
            <Text style={styles.previewMeta}>
              {parsed.length} clips captured
            </Text>
          ) : (
            <Text style={styles.previewMeta}>No clips found</Text>
          )}
          <TouchableOpacity
            style={[
              styles.playBtn,
              playing && styles.playingBtn,
              generating && styles.playDisabled,
            ]}
            disabled={!parsed.length || loading || generating}
            onPress={playAll}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.playBtnText}>
                {playing ? "Stop" : "Play Preview"}
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[
                styles.choiceBtn,
                happy === true && styles.choiceSelected,
              ]}
              disabled={generating}
              onPress={() => setHappy(true)}
            >
              <Text
                style={[
                  styles.choiceText,
                  happy === true && styles.choiceTextSelected,
                ]}
              >
                Looks Good
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.choiceBtn,
                happy === false && styles.choiceSelected,
              ]}
              disabled={generating}
              onPress={() => setHappy(false)}
            >
              <Text
                style={[
                  styles.choiceText,
                  happy === false && styles.choiceTextSelected,
                ]}
              >
                Needs Redo
              </Text>
            </TouchableOpacity>
          </View>
          {happy === false && (
            <Text style={styles.hintRedo}>
              Tap “Back to Recordings” below to try capturing cleaner input
              clips.
            </Text>
          )}
          {happy === true && (
            <Text style={styles.hintGood}>
              Great! Continue to add this voice to your list.
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() =>
            router.replace({ pathname: "/add_voice_3", params: { name } })
          }
          style={[styles.primary, happy === false && styles.primaryDisabled]}
          activeOpacity={0.9}
          disabled={happy === false || generating}
        >
          <Text style={styles.primaryText}>
            {generating ? "Please wait…" : "Add to Voices"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.secondary}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryText}>Back to Recordings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA" },
  safe: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  heading: { fontSize: 30, fontWeight: "700", color: "#111", marginTop: 8 },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 340,
  },
  previewBox: {
    backgroundColor: "#fff",
    marginTop: 28,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  previewTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  previewMeta: { fontSize: 12, color: "#555", marginTop: 6 },
  playBtn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  playDisabled: { opacity: 0.5 },
  playingBtn: { backgroundColor: "#DC2626" },
  playBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  loadingText: { fontSize: 12, color: "#334155" },
  choiceRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  choiceBtn: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  choiceSelected: { backgroundColor: "#2563EB" },
  choiceText: { fontSize: 13, fontWeight: "600", color: "#334155" },
  choiceTextSelected: { color: "#fff" },
  hintRedo: { marginTop: 14, fontSize: 12, color: "#B45309", lineHeight: 16 },
  hintGood: { marginTop: 14, fontSize: 12, color: "#047857", lineHeight: 16 },
  primaryDisabled: { backgroundColor: "#94A3B8" },
  primary: {
    backgroundColor: "#059669",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondary: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryText: { color: "#334155", fontSize: 14, fontWeight: "600" },
});
