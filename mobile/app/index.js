import { Pressable, StyleSheet, Text, TextInput, View, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import Screen from "../src/components/Screen";
import { colors } from "../src/constants/theme";

const mockApps = [
  {
    id: "promo-1",
    title: "Unlock Extra Earnings: Simple Micro-Tasks on Your Smartphone",
    description: "Discover how you can earn extra income by completing simple micro-tasks right from your smartphone. Perfect for anyone looking to make money in their spare time.",
    date: "October 14, 2026",
    accent: "#1d4ed8",
    visual: "▣",
    poster: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
    featured: true,
  },
  {
    id: "promo-2",
    title: "Stay Connected to Ethiopia with EthioCall Simcard",
    description: "Get the best rates for calls to Ethiopia with our premium simcard service.",
    date: "October 13, 2026",
    accent: "#2563eb",
    visual: "✦",
    poster: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
    featured: false,
  },
  {
    id: "promo-3",
    title: "Optimize Your Smartphone Performance",
    description: "Clean up your device and boost performance.",
    date: "October 18, 2026",
    accent: "#3b82f6",
    visual: "◈",
    poster: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    featured: false,
  },
  {
    id: "promo-4",
    title: "Transform Your Living Space with AI-Powered Home Decor",
    description: "AI-powered home design suggestions.",
    date: "October 17, 2026",
    accent: "#f59e0b",
    visual: "◍",
    poster: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
    featured: false,
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const featuredApp = mockApps[0];
  const recentApps = mockApps.slice(1);

  const filteredApps = searchQuery
    ? mockApps.filter((app) =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?code=${searchQuery.trim()}`);
    }
  };

  return (
    <Screen activeTab="recent">
      <View style={styles.header}>
        <Text style={styles.brandName}>Appora</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.headerIcon}>⋮</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {filteredApps ? (
        <>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <View style={styles.recentList}>
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <Pressable
                  key={app.id}
                  style={styles.recentItem}
                  onPress={() => router.push(`/app-details/${app.id}`)}
                >
                  <Image source={{ uri: app.poster }} style={styles.recentPoster} />
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>{app.title}</Text>
                    <Text style={styles.recentDate}>{app.date}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noResults}>No apps found</Text>
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Recent</Text>

          <Pressable
            style={styles.featuredCard}
            onPress={() => router.push(`/app-details/${featuredApp.id}`)}
          >
            <Image source={{ uri: featuredApp.poster }} style={styles.featuredPoster} />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>{featuredApp.title}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {featuredApp.description}
              </Text>
              <View style={styles.featuredMeta}>
                <Text style={styles.featuredDate}>{featuredApp.date}</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.recentList}>
            {recentApps.map((app) => (
              <Pressable
                key={app.id}
                style={styles.recentItem}
                onPress={() => router.push(`/app-details/${app.id}`)}
              >
                <Image source={{ uri: app.poster }} style={styles.recentPoster} />
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>{app.title}</Text>
                  <Text style={styles.recentDate}>{app.date}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: colors.brand,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIcon: {
    fontSize: 24,
    color: colors.ink,
    fontWeight: "600",
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  featuredCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featuredPoster: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 8,
    lineHeight: 24,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredDate: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  recentPoster: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: "cover",
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 4,
    lineHeight: 20,
  },
  recentDate: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 24,
    color: colors.muted,
    fontWeight: "300",
  },
  noResults: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 20,
  },
});
