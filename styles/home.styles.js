import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  section: {
    marginTop: 24,
  },

  systemCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },

  systemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  systemText: {
    fontSize: 15,
    lineHeight: 24,
  },

  storyRow: {
    marginTop: 24,
    flexDirection: "row",
    gap: 16,
  },
});