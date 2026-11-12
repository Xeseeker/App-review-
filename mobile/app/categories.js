import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Screen from "../src/components/Screen";
import AppCard from "../src/components/AppCard";
import { Loading, Message } from "../src/components/StateView";
import { getApps } from "../src/services/api";
import { colors } from "../src/constants/theme";

const categories = [
  { id: "online-jobs", name: "Online Jobs", icon: "💼", color: "#3b82f6" },
  { id: "app-review", name: "App Review", icon: "📱", color: "#8b5cf6" },
  { id: "tech-tips", name: "Tech Tips", icon: "💡", color: "#f59e0b" },
];

export default function Categories() {
  const { id, name } = useLocalSearchParams();
  const [apps, setApps] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return setApps([]);
    setError("");
    try {
      const result = await getApps({ category: id, limit: 50 });
      setApps(result.data);
    } catch {
      setError("Could not load apps in this category.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!id)
    return (
      <Screen activeTab="category">
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.brandName}>Appora</Text>
            </View>
            <Text style={styles.title}>Categories</Text>
            <View style={styles.categoryList}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => router.push(`/categories?id=${category.id}&name=${category.name}`)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Text style={styles.categoryIconText}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </Screen>
    );

  return (
    <Screen activeTab="category">
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brandName}>Appora</Text>
          </View>
          <Text style={styles.title}>{name}</Text>
          {error ? (
            <Message title="Category unavailable" message={error} onRetry={load} />
          ) : !apps ? (
            <Loading />
          ) : apps.length ? (
            apps.map((app) => <AppCard app={app} key={app.id} />)
          ) : (
            <Message
              title="No apps here yet"
              message="Check again when new apps are published."
            />
          )}
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 16,
  },
  categoryList: {
    flexDirection: "row",
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconText: {
    fontSize: 36,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
});
