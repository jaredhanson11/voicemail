import { theme } from "@/resources/styles";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.backgroundColor.backgroundColor,
        },
        contentStyle: { borderWidth: 0 },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="page_1" options={{ headerShown: false }} />
      <Stack.Screen
        name="voice_details_1"
        options={{
          headerStyle: {
            backgroundColor: theme.backgroundColor.backgroundColor,
          },
          title: "",
          headerBackButtonDisplayMode: "minimal",
          headerTitleStyle: { fontSize: 22 },
        }}
      />
      <Stack.Screen
        name="add_voice_1"
        options={{
          title: "Add New Voice",
          headerBackButtonDisplayMode: "minimal",
          headerTitleStyle: { fontSize: 22 },
        }}
      />
      <Stack.Screen
        name="add_voice_2"
        options={{
          headerStyle: {
            backgroundColor: theme.backgroundColor.backgroundColor,
          },
          title: "",
          headerBackButtonDisplayMode: "minimal",
          headerTitleStyle: { fontSize: 22 },
        }}
      />
      <Stack.Screen
        name="add_voice_3"
        options={{
          headerStyle: {
            backgroundColor: theme.backgroundColor.backgroundColor,
          },
          title: "",
          headerBackButtonDisplayMode: "minimal",
          headerTitleStyle: { fontSize: 22 },
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
