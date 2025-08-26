import { theme } from "@/resources/styles";
import { Audio } from "expo-av";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Local demo preview asset (fallback when no recorded clips available)
const previewAudio = require("../assets/audio/preview.mp3");
// (imports consolidated above)

// Simulated training duration
const TRAIN_DURATION = 1600; // demo timing
// Fake preview generation delay after training before enabling play
const PREVIEW_READY_DELAY = 1200;

export default function AddVoiceTrainingScreen() {
  const params = useLocalSearchParams<{ name?: string; clips?: string }>();
  const voiceName = params.name || "Grandpa Joe"; // default shown in mock
  const [phase, setPhase] = useState<"training" | "preview" | "success">(
    "training"
  );
  const [previewReady, setPreviewReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const containerBg =
    typeof theme.backgroundColor === "string"
      ? { backgroundColor: theme.backgroundColor }
      : theme.backgroundColor;

  // Phase 1: training animation
  useEffect(() => {
    if (phase !== "training") return;
    Animated.timing(progress, {
      toValue: 1,
      duration: TRAIN_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    const t = setTimeout(() => {
      setPhase("preview");
      // simulate preview processing
      setTimeout(() => setPreviewReady(true), PREVIEW_READY_DELAY);
    }, TRAIN_DURATION);
    return () => clearTimeout(t);
  }, [phase, progress]);

  const progWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Confetti
  type ConfettiPiece = {
    id: number;
    xPct: number;
    size: number;
    color: string;
    fall: Animated.Value;
    spin: Animated.Value;
    delay: number;
    duration: number;
  };
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const [, force] = useState(0);
  const startedRef = useRef(false);
  const { height } = Dimensions.get("window");

  useEffect(() => {
    if (phase === "success" && !startedRef.current) {
      startedRef.current = true;
      const COLORS = [
        "#F87171",
        "#FBBF24",
        "#34D399",
        "#60A5FA",
        "#A78BFA",
        "#F472B6",
      ];
      piecesRef.current = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        xPct: Math.random() * 100,
        size: 6 + Math.random() * 10,
        color: COLORS[i % COLORS.length],
        fall: new Animated.Value(0),
        spin: new Animated.Value(0),
        delay: Math.random() * 400,
        duration: 2500 + Math.random() * 2000,
      }));
      piecesRef.current.forEach((p) => {
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.parallel([
            Animated.timing(p.fall, {
              toValue: 1,
              duration: p.duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(p.spin, {
              toValue: 1,
              duration: p.duration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
      force((v) => v + 1);
    }
  }, [phase]);

  async function togglePlay() {
    if (!previewReady) return;
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
    // Always use the bundled demo sample audio for preview (ignore recorded clips)
    try {
      const { sound } = await Audio.Sound.createAsync(previewAudio as any);
      soundRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setPlaying(false);
          soundRef.current?.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch (e) {
      console.warn("preview play err", e);
    }
  }

  return (
    <View style={[styles.root, containerBg]}>
      <Stack.Screen
        options={{
          title:
            phase === "training"
              ? "Training Voice"
              : phase === "preview"
              ? "Preview Voice"
              : "Voice Added",
          headerBackTitle: "",
        }}
      />
      {phase === "training" && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <View style={styles.spacer16} />
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progWidth }]} />
          </View>
          <View style={styles.spacer24} />
          <Text style={styles.phaseTitle}>Training Voice Model</Text>
          <Text style={styles.phaseBody}>
            We&apos;re analyzing the voice patterns and creating a personalized
            model. This usually takes about 30 seconds.
          </Text>
        </View>
      )}
      {phase === "preview" && (
        <View style={styles.center}>
          <Text style={styles.previewHeading}>Preview & Validate</Text>
          <Text style={styles.previewBody}>
            Listen to a snippet. If you like the tone and clarity, confirm. If
            not, go back and re‑record with natural, conversational energy (not
            a monotone read).
          </Text>
          <View style={styles.waveBox}>
            <View style={styles.fakeWaveRow}>
              {Array.from({ length: 28 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: 8 + Math.sin(i) * 8 + (i % 3) * 4 },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.playBar, !previewReady && styles.playBarDisabled]}
              disabled={!previewReady}
              onPress={togglePlay}
            >
              <Text style={styles.playBarText}>
                {!previewReady
                  ? "Processing…"
                  : playing
                  ? "Pause Preview"
                  : "Play Preview"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn]}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryBtnText}>Retry Recordings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryBtnLarge,
                !previewReady && styles.primaryBtnDisabled,
              ]}
              disabled={!previewReady}
              onPress={() => setPhase("success")}
            >
              <Text style={styles.primaryBtnLargeText}>Looks Good</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.retryHint}>
            Tip: Use a medium distance, clear but relaxed speaking, vary pitch
            slightly—avoid reading cadence.
          </Text>
        </View>
      )}
      {phase === "success" && (
        <View style={styles.center}>
          <View style={styles.confettiLayer} pointerEvents="none">
            {piecesRef.current.map((p) => {
              const translateY = p.fall.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, height + 40],
              });
              const rotate = p.spin.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "720deg"],
              });
              return (
                <Animated.View
                  key={p.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${p.xPct}%`,
                    width: p.size,
                    height: p.size * 0.6,
                    backgroundColor: p.color,
                    borderRadius: 2,
                    transform: [{ translateY }, { rotate }],
                    opacity: p.fall.interpolate({
                      inputRange: [0, 0.85, 1],
                      outputRange: [1, 1, 0],
                    }),
                  }}
                />
              );
            })}
          </View>
          <View style={styles.successCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
          <View style={styles.spacer24} />
          <Text style={styles.successTitle}>
            Voice Added{voiceName ? " Successfully!" : "!"}{" "}
          </Text>
          <Text style={styles.successBody}>
            {voiceName}&apos;s voice has been trained and is ready to share
            words of encouragement with you.
          </Text>
          <View style={styles.spacer32} />
          <TouchableOpacity
            onPress={() =>
              router.replace({
                pathname: "/page_1",
                params: { new_person: "true" },
              })
            }
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>View All Voices</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
  spacer32: { height: 32 },
  phaseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  phaseBody: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#444",
    maxWidth: 260,
  },
  progressTrack: {
    width: "70%",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: { height: 4, backgroundColor: "#2563eb" },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  check: { fontSize: 34, color: "#fff", fontWeight: "600" },
  successTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  successBody: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#444",
    maxWidth: 260,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: "#1D63FF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  confettiLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  previewHeading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#444",
    textAlign: "center",
    marginTop: 12,
    maxWidth: 300,
  },
  waveBox: {
    marginTop: 32,
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  fakeWaveRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 48,
    gap: 3,
  },
  waveBar: { width: 4, backgroundColor: "#2563EB", borderRadius: 2 },
  playBar: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  playBarDisabled: { backgroundColor: "#94A3B8" },
  playBarText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 28,
    width: "100%",
    maxWidth: 340,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#1E293B", fontWeight: "600", fontSize: 13 },
  primaryBtnLarge: {
    flex: 1,
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  primaryBtnDisabled: { backgroundColor: "#A7F3D0" },
  primaryBtnLargeText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  retryHint: {
    marginTop: 18,
    fontSize: 11,
    lineHeight: 16,
    color: "#475569",
    textAlign: "center",
    maxWidth: 320,
  },
});
