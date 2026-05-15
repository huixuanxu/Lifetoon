import { View, Text } from "react-native";

export default function MascotBubble() {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 18,
        marginTop: 24,
      }}
    >
      <Text>👾 今天發生什麼故事呢？</Text>
    </View>
  );
}