import { View, TextInput, TouchableOpacity, Text } from "react-native";

export default function PromptBox() {
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 20,
      }}
    >
      <TextInput
        placeholder="聊聊今天的劇情..."
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 30,
          paddingHorizontal: 20,
          height: 56,
        }}
      />

      <TouchableOpacity
        style={{
          width: 56,
          height: 56,
          marginLeft: 12,
          borderRadius: 28,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>→</Text>
      </TouchableOpacity>
    </View>
  );
}