// Temporary audio abstraction to isolate deprecated expo-av usage.
// Swap implementation to expo-audio when upgrading to SDK 54.
import { Audio } from "expo-av";

export async function ensureAudioPermissions(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === "granted";
}

export interface ActiveRecording {
  recording: Audio.Recording;
  stop: () => Promise<FinishedRecording | null>;
}
export interface FinishedRecording {
  uri: string | null;
  durationMs?: number;
}

export async function startNewRecording(): Promise<ActiveRecording> {
  const rec = new Audio.Recording();
  await setRecordingMode();
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
  const startedAt = Date.now();
  await rec.startAsync();
  return {
    recording: rec,
    stop: async () => {
      try {
        await rec.stopAndUnloadAsync();
        return { uri: rec.getURI(), durationMs: Date.now() - startedAt };
      } catch (e) {
        console.warn("stop recording error", e);
        return null;
      }
    },
  };
}

// Explicit audio mode helpers to avoid iOS earpiece routing when not recording
export async function setRecordingMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    interruptionModeIOS: 1, // DO_NOT_MIX (numeric fallback)
    interruptionModeAndroid: 1,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: false,
  });
}

export async function setPlaybackMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    interruptionModeIOS: 1,
    interruptionModeAndroid: 1,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: false,
  });
  // Small delay can help route settle on some devices
  await new Promise((r) => setTimeout(r, 60));
}

export async function loadAndPlay(
  source: { uri?: string; asset?: number },
  onFinish?: () => void
) {
  const { uri, asset } = source;
  await setPlaybackMode();
  const { sound } = await Audio.Sound.createAsync(
    asset ? asset : { uri: uri! }
  );
  if (onFinish) {
    sound.setOnPlaybackStatusUpdate((st) => {
      if (!st.isLoaded) return;
      if (st.didJustFinish) onFinish();
    });
  }
  await sound.playAsync();
  return sound;
}

export async function loadSound(
  source: { uri?: string; asset?: number },
  onStatus?: (st: any) => void
) {
  await setPlaybackMode();
  const { sound } = await Audio.Sound.createAsync(
    source.asset ? source.asset : { uri: source.uri! }
  );
  if (onStatus) sound.setOnPlaybackStatusUpdate(onStatus);
  return sound;
}
