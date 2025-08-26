import Voices, { VoiceItem } from "@/resources/Voices";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const routerHook = useRouter();
  const { new_person } = useLocalSearchParams<{ new_person?: string }>();
  const isNewPerson = new_person === "true";

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Voices
          items={sampleVoices(isNewPerson)}
          onAdd={() => routerHook.push("/add_voice_1")}
          onSelect={(item) =>
            routerHook.push({
              pathname: "/voice_details_1",
              params: { name: item.name },
            })
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F9FA" },
  safe: { flex: 1 },
});

// Keep core list lean: Grandma (image asset) + two sample others with emoji avatars.
function pickTwo(): string[] {
  const shuffled = ["👵🏻", "👨🏻‍🦲"];
  return shuffled.slice(0, 2);
}
const [emojiOne, emojiTwo] = pickTwo();

function bgFor(emoji: string): string {
  switch (emoji) {
    case "👵🏻":
      return "#FDE2C8";
    case "👵🏽":
      return "#FFE9B5";
    case "👩🏻‍🦳":
      return "#E6F1FF";
    case "👩🏻‍🦱":
      return "#FFE4F1";
    case "👴🏻":
      return "#FFE3D3";
    case "👴🏽":
      return "#E2F7D9";
    case "👨🏻‍🦳":
      return "#E8ECFF";
    case "👨🏻‍🦲":
      return "#F1E4FF";
    default:
      return "#EEE";
  }
}
function nameFor(emoji: string): string {
  switch (emoji) {
    case "👵🏻":
      return "Grandma Lily";
    case "👵🏽":
      return "Grandma Maria";
    case "👩🏻‍🦳":
      return "Nana Pearl";
    case "👩🏻‍🦱":
      return "Nana Gloria";
    case "👴🏻":
      return "Grandpa Henry";
    case "👴🏽":
      return "Papa Louis";
    case "👨🏻‍🦳":
      return "Grandpa Walter";
    case "👨🏻‍🦲":
      return "Grandpa Sam";
    default:
      return "Grandparent";
  }
}

function sampleVoices(extra: boolean = false): VoiceItem[] {
  return [
    ...(extra
      ? [
          {
            name: nameFor("👴🏽"),
            added: "just now",
            avatar: "👴🏽",
            backgroundColor: bgFor("👴🏽"),
          },
        ]
      : []),
    {
      name: "Grandma Rose",
      added: "1 year ago",
      avatar: "local:voice_details_avatar",
      backgroundColor: "#FDE2C8",
    },
    {
      name: nameFor(emojiOne),
      added: "4 years ago",
      avatar: emojiOne,
      backgroundColor: bgFor(emojiOne),
    },
    {
      name: nameFor(emojiTwo),
      added: "7 years ago",
      avatar: emojiTwo,
      backgroundColor: bgFor(emojiTwo),
    },
  ];
}
