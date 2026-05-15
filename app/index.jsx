import { 
  View,
  Text,
  ScrollView,
  ImageBackground
 } from "react-native";

import Header from "../components/HomeHeader";
import PromptBox from "../components/PromptBox";
import MascotBubble from "../components/MascotBubble";
import StoryCard from "../components/StoryCard";

import { styles } from "../styles/home.styles";

const bg = require("../assets/images/LTbackground.png");

export default function Home() {
  return (
    <ImageBackground
        source={bg}
        style={{ flex: 1 }}
        resizeMode="cover"
        >
        <ScrollView style={styles.container}>
        <Header />

        <View style={styles.systemCard}>
            <Text style={styles.systemTitle}>
            SYSTEM
            </Text>

            <Text style={styles.systemText}>
            Hello!
            </Text>
        </View>

        <PromptBox />

        <MascotBubble />

        <View style={styles.storyRow}>
            <StoryCard />
            <StoryCard />
        </View>
        </ScrollView>
    </ImageBackground>
  );
}