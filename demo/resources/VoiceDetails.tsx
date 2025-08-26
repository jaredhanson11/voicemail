import { theme } from "@/resources/styles";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export type VoiceItem = {
  name: string;
  added: string;
  avatar: string;
  backgroundColor: string; // keeping original key (typo) to match usage elsewhere if any
};

export default function Voices(props: {
  items: VoiceItem[];
  onAdd?: () => void;
}) {
  return (
    <View style={styles.main}>
      <Text style={theme.pageHeader}>Your Voices</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {props.items.map((item) => {
          return (
            <View key={item.name} style={styles.item}>
              <View style={[styles.itemAvatar]} />
              <View style={[styles.itemText]}>
                <Text style={[styles.itemTextName]}>{item.name}</Text>
                <Text style={[styles.itemSubtext]}>{item.added}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.addButton}>
        <Text style={styles.addButtonText} onPress={props.onAdd}>
          + Add Voice
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    height: "100%",
    width: "100%",
  },
  list: {
    paddingHorizontal: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  item: {
    width: "100%",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 30,
    display: "flex",
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  itemAvatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderColor: "black",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  itemText: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  itemTextName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
  },
  itemSubtext: {
    color: "#333",
    fontSize: 18,
    textAlign: "left",
  },
  addButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
