import { StyleSheet } from "react-native";

export const theme = StyleSheet.create({
  backgroundColor: {
    backgroundColor: "#F8F9FA",
    flex: 1,
    height: "100%",
    width: "100%",
  },
  pageHeader: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 30,
    marginTop: 30,
  },
  pageContiner: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
});
