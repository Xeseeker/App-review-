import { Pressable, StyleSheet, Text, TextInput, View, Image, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import Screen from "../src/components/Screen";
import { colors } from "../src/constants/theme";
import { getRecentApps, getApps } from "../src/services/api";
import { Loading, Message } from "../src/components/StateView";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApps = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRecentApps();
      setApps(data);
    } catch (err) {
      setError("Could not load apps. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?code=${searchQuery.trim()}`);
    }
  };

  const featuredApp = apps && apps.length > 0 ? apps[0] : null;
  const recentApps = apps && apps.length > 1 ? apps.slice(1) : [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Screen activeTab="recent">
        <View style={styles.header}>
          <Text style={styles.brandName}>Appora</Text>
          <View style={styles.headerIcons}>
            <Text style={styles.headerIcon}>⋮</Text>
          </View>
        </View>
        <Loading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen activeTab="recent">
        <View style={styles.header}>
          <Text style={styles.brandName}>Appora</Text>
          <View style={styles.headerIcons}>
            <Text style={styles.headerIcon}>⋮</Text>
          </View>
        </View>
        <Message title="Unable to load apps" message={error} onRetry={loadApps} />
      </Screen>
    );
  }

  return (
    <Screen activeTab="recent">
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
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

          <Text style={styles.sectionTitle}>Recent</Text>

          {featuredApp && (
            <Pressable
              style={styles.featuredCard}
              onPress={() => router.push(`/app-details/${featuredApp.id}`)}
            >
              {featuredApp.poster_url ? (
                <Image source={{ uri: featuredApp.poster_url }} style={styles.featuredPoster} />
              ) : (
                <View style={[styles.featuredPoster, styles.posterPlaceholder]} />
              )}
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>{featuredApp.name}</Text>
                <Text style={styles.featuredDescription} numberOfLines={2}>
                  {featuredApp.short_description || featuredApp.description}
                </Text>
                <View style={styles.featuredMeta}>
                  <Text style={styles.featuredDate}>{formatDate(featuredApp.created_at)}</Text>
                </View>
              </View>
            </Pressable>
          )}

          <View style={styles.recentList}>
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <Pressable
                  key={app.id}
                  style={styles.recentItem}
                  onPress={() => router.push(`/app-details/${app.id}`)}
                >
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>{app.name}</Text>
                    <Text style={styles.recentDescription} numberOfLines={2}>
                      {app.short_description || app.description}
                    </Text>
                    <Text style={styles.recentDate}>{formatDate(app.created_at)}</Text>
                  </View>
                  {app.poster_url ? (
                    <Image source={{ uri: app.poster_url }} style={styles.recentPoster} />
                  ) : (
                    <View style={[styles.recentPoster, styles.posterPlaceholder]} />
                  )}
                </Pressable>
              ))
            ) : (
              <Text style={styles.noResults}>No recent apps</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
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
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginBottom: 24,
  },
  featuredPoster: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    resizeMode: "cover",
    marginBottom: 12,
  },
  featuredContent: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 24,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
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
    gap: 16,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  recentPoster: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: "cover",
  },
  recentContent: {
    flex: 1,
    gap: 4,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 22,
  },
  recentDescription: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  recentDate: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  noResults: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 20,
  },
  posterPlaceholder: {
    backgroundColor: "#e0e7ff",
  },
});
