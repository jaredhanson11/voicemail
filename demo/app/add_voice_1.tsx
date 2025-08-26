import { EMOJI_AVATARS } from "@/resources/avatarPalette";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Using centrally defined emoji avatar palette

export default function AddVoiceStep1() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const canContinue = name.trim().length > 1 && avatar;

  // Derived emoji objects (stable identity via key for rendering)
  const avatars = useMemo(() => EMOJI_AVATARS, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Text style={styles.screenTitle}>Create Voice</Text>
          <Text style={styles.subtitle}>
            Give this voice a friendly name and choose an avatar.
          </Text>

          {/* Name Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Voice Name</Text>
            <TextInput
              placeholder="e.g. Grandma Rose"
              value={name}
              onChangeText={setName}
              style={styles.input}
              returnKeyType="done"
              maxLength={40}
            />
            <Text style={styles.helper}>
              This helps you recognize the voice later.
            </Text>
          </View>

          {/* Avatar Card */}
          <View style={[styles.card, { marginTop: 22 }]}>
            <Text style={styles.label}>Avatar</Text>
            <View style={styles.avatarGrid}>
              {avatars.map((a) => {
                const selected = avatar === a.char;
                return (
                  <TouchableOpacity
                    key={a.char}
                    style={[
                      styles.emojiCell,
                      { backgroundColor: a.bg },
                      selected && styles.avatarSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select avatar ${a.char}`}
                    onPress={() => setAvatar(a.char)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.emoji}>{a.char}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            disabled={!canContinue}
            onPress={() =>
              router.push({
                pathname: "/add_voice_2",
                params: { name, avatar },
              })
            }
            style={[
              styles.primaryBtn,
              !canContinue && styles.primaryBtnDisabled,
            ]}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA" },
  safe: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  screenTitle: { fontSize: 30, fontWeight: "700", marginTop: 8, color: "#111" },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
  },
  helper: { fontSize: 12, color: "#6B7280", marginTop: 8 },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  emojiCell: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#DBEAFE",
  },
  emoji: { fontSize: 34, color: "#111" },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
