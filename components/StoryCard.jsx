import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function StoryCard({ title, subtitle, status, image }) {
  return (
    <View style={styles.cardContainer}>
      {/* 頂部文字區域 */}
      <View style={styles.textContainer}>
        <Text style={styles.mainTitle} numberOfLines={1}>
          {title || "未定義名稱"}
        </Text>
        {subtitle ? (
          <Text style={styles.subTitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* 圖片區域：有傳入圖片才顯示，沒傳入則自動隱藏並撐滿空間 */}
      {image ? (
        <View style={styles.imageFrame}>
          <Image source={image} style={styles.cardImage} resizeMode="cover" />
        </View>
      ) : (
        // 沒圖片時，留出一個透明彈性空間，讓狀態能好好待在右下角
        <View style={{ flex: 1 }} />
      )}

      {/* 底部狀態區域 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText} numberOfLines={1}>
          {status || "進行中 0 項"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 250,          // 寬度加大，讓它在 Swiper 左右滑動時有極佳的單頁焦點感
    height: 340,         // 固定高度，完美契合 Swiper 的 380 高度
    backgroundColor: "#FFFFFF",
    borderWidth: 2,      // 漫畫風粗黑外框
    borderColor: "#000000",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
    // 扎實的硬邊下陰影風格
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  textContainer: {
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "800",  // 特粗字體
    color: "#000000",
  },
  subTitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    fontWeight: "500",
  },
  imageFrame: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#000000", // 圖片也加上精緻細黑邊
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  statusContainer: {
    alignItems: "flex-end", // 靠右對齊
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888888", // 灰字狀態
  },
});