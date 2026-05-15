import { View, Text } from "react-native";

export default function StoryCard() {
  return (
    <View
      style={{
        width: 160,
        height: 220,
        borderRadius: 24,
        backgroundColor: "#fff",
        padding: 18,
      }}
    >
      <Text style={{ fontWeight: "700" }}>
        待定義的故事
      </Text>

      <Text style={{ marginTop: 8 }}>
        序章
      </Text>
    </View>
  );
}