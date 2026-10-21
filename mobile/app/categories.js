import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Screen from "../src/components/Screen";
import AppCard from "../src/components/AppCard";
import { Loading, Message } from "../src/components/StateView";
import { getApps } from "../src/services/api";
import { colors } from "../src/constants/theme";
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
        <View style={styles.header}>
          <Text style={styles.brandName}>Appora</Text>
        </View>
        <Message
          title="Choose a category"
          message="Pick one from the home screen to browse its apps."
        />
      </Screen>
    );

  return (
    <Screen activeTab="category">
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 12,
  },
});
