import { setPlaybackMode } from "@/resources/audioAdapter";
import { theme } from "@/resources/styles";
import { Audio } from "expo-av";
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Multi-clip guidance
const INSTRUCTIONS =
  "Record each short phrase in order. Natural pace, clear tone. Replay or redo any clip before continuing.";

// Scenario-style phrases (longer narrative lines) for recording demo
const PHRASES = [
  "Can you believe this traffic? I don't know where all these cars came from. One moment we were flying down the highway and next we were at a standstill. I hope I don't miss my flight. It's at 5:30 pm.",
  "The weather has been such a disappointment today. It started raining before I woke up the kids for school and hasn't let up. I hope they brought their raincoats.",
  "Hey, I'm sorry I missed your call. I was in a meeting and couldn't step away. You can give me a call back at 406-925-3178.",
  "On Wednesday, I stopped by that new coffee shop on Main Street and it was so busy. I was almost late for work!",
];

type ClipStatus = "pending" | "recording" | "done";
interface ClipData {
  id: string;
  phrase: string;
  status: ClipStatus;
  uri?: string;
  durationMs?: number;
}

export default function RecordVoiceScreen() {
  const [clips, setClips] = useState<ClipData[]>(() =>
    PHRASES.map((p, i) => ({ id: `clip_${i}`, phrase: p, status: "pending" }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startingRef = useRef(false); // guard against rapid double-start
  const stoppingRef = useRef(false); // guard against rapid double-stop
  const playingSoundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPerms = useCallback(async () => {
    if (permissionGranted !== null) return permissionGranted;
    const { status } = await Audio.requestPermissionsAsync();
    const ok = status === "granted";
    setPermissionGranted(ok);
    return ok;
  }, [permissionGranted]);

  const startRecording = useCallback(async () => {
    if (recording || startingRef.current || stoppingRef.current) return;
    if (recordingRef.current) {
      // safety: shouldn't happen, but avoid preparing second recording
      return;
    }
    startingRef.current = true;
    const ok = await requestPerms();
    if (!ok) return;
    setElapsedMs(0);
    setRecording(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      recordingRef.current = rec;
      await rec.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
      });
      await rec.startAsync();
      // mark clip status as recording
      setClips((prev) => {
        const copy = [...prev];
        const c = copy[currentIndex];
        if (c && c.status !== "done") c.status = "recording";
        return copy;
      });
      const startTs = Date.now();
      timerRef.current = setInterval(
        () => setElapsedMs(Date.now() - startTs),
        200
      );
    } catch (e) {
      console.warn("record start error", e);
      setRecording(false);
      setClips((prev) => {
        const copy = [...prev];
        const c = copy[currentIndex];
        if (c && c.status === "recording") c.status = "pending";
        return copy;
      });
      try {
        recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      } catch {}
      recordingRef.current = null;
    } finally {
      startingRef.current = false;
    }
  }, [recording, requestPerms, currentIndex]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current || !recording || stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setClips((prev) => {
        const copy = [...prev];
        const c = copy[currentIndex];
        if (c) {
          c.status = "done";
          c.uri = uri || undefined;
          c.durationMs = elapsedMs;
        }
        return copy;
      });
      // Switch session back to playback-only to force loudspeaker routing on iOS
      try {
        await setPlaybackMode();
      } catch {}
    } catch (e) {
      console.warn("record stop error", e);
    } finally {
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      recordingRef.current = null;
      setCurrentIndex((idx) => (idx + 1 < PHRASES.length ? idx + 1 : idx));
      stoppingRef.current = false;
    }
  }, [recording, currentIndex, elapsedMs]);

  const playClip = useCallback(async (clip: ClipData) => {
    if (!clip.uri) return;
    if (playingSoundRef.current) {
      try {
        await playingSoundRef.current.stopAsync();
      } catch {}
      try {
        await playingSoundRef.current.unloadAsync();
      } catch {}
      playingSoundRef.current = null;
      setPlayingClipId(null);
    }
    try {
      // Ensure playback mode (speaker) before creating sound
      try {
        await setPlaybackMode();
      } catch {}
      const { sound } = await Audio.Sound.createAsync({ uri: clip.uri });
      playingSoundRef.current = sound;
      setPlayingClipId(clip.id);
      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setPlayingClipId(null);
          playingSoundRef.current?.unloadAsync().catch(() => {});
          playingSoundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch (e) {
      console.warn("play error", e);
    }
  }, []);

  const pauseClip = useCallback(async () => {
    if (!playingSoundRef.current) return;
    try {
      await playingSoundRef.current.pauseAsync();
    } catch {}
    setPlayingClipId(null);
  }, []);

  const redoClip = useCallback(
    (clip: ClipData, index: number) => {
      if (recording) return; // guard while active
      setClips((prev) => {
        const copy = [...prev];
        const c = copy[index];
        if (c) {
          c.status = "pending";
          c.uri = undefined;
          c.durationMs = undefined;
        }
        return copy;
      });
      setCurrentIndex(index);
    },
    [recording]
  );

  const allDone = clips.every((c) => c.status === "done");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      playingSoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const containerBg =
    typeof theme.backgroundColor === "string"
      ? { backgroundColor: theme.backgroundColor }
      : theme.backgroundColor;

  function formatMs(ms?: number) {
    if (!ms) return "00:00";
    const s = Math.floor(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  return (
    <View style={[styles.root, containerBg]}>
      <Stack.Screen options={{ title: "Record Voice", headerBackTitle: "" }} />
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <Text style={styles.heading}>Record Phrases</Text>
        <Text style={styles.subheading}>{INSTRUCTIONS}</Text>
        {/* Timer slot to avoid layout shift when starting/stopping recordings */}
        <View style={styles.timerSlot}>
          {recording ? (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{formatMs(elapsedMs)}</Text>
            </View>
          ) : null}
        </View>

        <FlatList
          data={clips}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: 120,
            gap: 14,
          }}
          renderItem={({ item, index }) => {
            const isActive = index === currentIndex; // the one user is on (recording or next to record)
            const isRecording = item.status === "recording";
            const isPlaying = playingClipId === item.id;
            const showRecordButton =
              isActive && !recording && item.status !== "done";
            return (
              <View
                style={[
                  styles.clipCard,
                  isActive ? styles.clipCardActive : styles.clipCardCollapsed,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.clipPhrase,
                      isActive && styles.clipPhraseActive,
                    ]}
                    numberOfLines={isActive ? undefined : 2}
                  >
                    {item.phrase}
                  </Text>
                  <Text
                    style={[styles.clipMeta, isActive && styles.clipMetaActive]}
                  >
                    {item.status === "done"
                      ? `Recorded • ${formatMs(item.durationMs)}`
                      : isRecording
                      ? `Recording… ${formatMs(elapsedMs)}`
                      : isActive
                      ? "Ready to record"
                      : "Pending"}
                  </Text>
                </View>
                {showRecordButton && (
                  <TouchableOpacity
                    onPress={startRecording}
                    style={[styles.smallRoundBtn, styles.recordStartBtn]}
                    accessibilityLabel="Start recording"
                    activeOpacity={0.85}
                  >
                    <View style={styles.smallRoundInner} />
                  </TouchableOpacity>
                )}
                {isRecording && (
                  <TouchableOpacity
                    onPress={stopRecording}
                    style={[styles.smallRoundBtn, styles.recordingActiveBtn]}
                    accessibilityLabel="Stop recording"
                    activeOpacity={0.85}
                  >
                    <View style={styles.stopSquare} />
                  </TouchableOpacity>
                )}
                {item.status === "done" && (
                  <View style={styles.rowBtns}>
                    <TouchableOpacity
                      onPress={() => (isPlaying ? pauseClip() : playClip(item))}
                      style={[
                        styles.actionPill,
                        isPlaying ? styles.pillPlaying : styles.pillPlay,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.pillText}>
                        {isPlaying ? "Pause" : "Play"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => redoClip(item, index)}
                      style={[styles.actionPill, styles.pillRedo]}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.pillText}>Redo</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
        {recording && (
          <ActivityIndicator
            color="#2563EB"
            style={{ position: "absolute", top: 8, right: 20 }}
          />
        )}
        {allDone && (
          <TouchableOpacity
            onPress={() => {
              const uris = clips.filter((c) => c.uri).map((c) => c.uri!);
              router.push({
                pathname: "/add_voice_3",
                params: { clips: JSON.stringify(uris) },
              });
            }}
            style={styles.fullWidthNext}
            activeOpacity={0.9}
          >
            <Text style={styles.fullWidthNextText}>Generate Voice</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  heading: { fontSize: 28, fontWeight: "700", color: "#111", marginTop: 4 },
  subheading: {
    fontSize: 13,
    color: "#555",
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 380,
  },
  timerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  timerSlot: { height: 40, marginTop: 16, justifyContent: "center" },
  timerText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  clipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    gap: 14,
  },
  clipCardActive: {
    borderWidth: 2,
    borderColor: "#2563EB",
    paddingVertical: 20,
    backgroundColor: "#F0F6FF",
  },
  clipCardCollapsed: {
    opacity: 0.75,
  },
  clipPhrase: { fontSize: 14, fontWeight: "600", color: "#111" },
  clipPhraseActive: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  clipMeta: { fontSize: 11, color: "#555", marginTop: 4 },
  clipMetaActive: { fontSize: 12, color: "#1E3A8A", fontWeight: "600" },
  smallRoundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  recordStartBtn: { backgroundColor: "#EF4444" },
  recordingActiveBtn: { backgroundColor: "#DC2626" },
  smallRoundInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  stopSquare: {
    width: 18,
    height: 18,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  rowBtns: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  pillPlay: { backgroundColor: "#2563EB" },
  pillPlaying: { backgroundColor: "#DC2626" },
  pillRedo: { backgroundColor: "#6B7280" },
  pillText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  fullWidthNext: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 30,
    backgroundColor: "#059669",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  fullWidthNextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
