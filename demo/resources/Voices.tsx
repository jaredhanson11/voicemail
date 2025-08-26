import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type VoiceItem = {
  name: string;
  added: string;
  avatar: string;
  backgroundColor: string; // keeping original key (typo) to match usage elsewhere if any
};

type VoicesProps = {
  items: VoiceItem[];
  onAdd?: () => void;
  onSelect?: (item: VoiceItem) => void;
};

export default function Voices({ items, onAdd, onSelect }: VoicesProps) {
  // Add a synthetic footer spacer so floating button doesn't cover last item
  const data = useMemo(() => items, [items]);

  function isLikelyUrl(str: string): boolean {
    return /^https?:\/\//i.test(str);
  }

  function formatRelative(iso: string): string {
    // Accept YYYY-MM-DD or ISO date
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const yr = Math.floor(day / 365);
    if (sec < 60) return "just now";
    if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
    if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
    if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
    if (day < 365) {
      const mo = Math.floor(day / 30);
      return `${mo} month${mo === 1 ? "" : "s"} ago`;
    }
    return `${yr} year${yr === 1 ? "" : "s"} ago`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Voices</Text>
      <FlatList
        data={data}
        keyExtractor={(i) => i.name}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onSelect?.(item)}
          >
            <View
              style={[
                styles.avatarWrap,
                { backgroundColor: item.backgroundColor },
              ]}
            >
              {item.avatar.startsWith("local:voice_details_avatar") ? (
                <Image
                  source={require("@/assets/images/voice_details_avatar.png")}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : isLikelyUrl(item.avatar) ? (
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.emojiAvatar}>{item.avatar}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Added {item.added}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 90 }} />}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Add Voice"
        style={styles.fab}
        activeOpacity={0.9}
        onPress={onAdd}
      >
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  header: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "left",
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    gap: 16,
  },
  avatarWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  avatarImg: { width: "100%", height: "100%" },
  emojiAvatar: { fontSize: 40 },
  name: { fontSize: 17, fontWeight: "600", color: "#111", marginBottom: 4 },
  meta: { fontSize: 12, color: "#555" },
  chevron: { fontSize: 26, color: "#999", paddingLeft: 4 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "#2563EB",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  fabPlus: { fontSize: 34, lineHeight: 38, color: "#fff" },
});
