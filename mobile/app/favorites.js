import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Screen from "../src/components/Screen";
import AppCard from "../src/components/AppCard";
import { Loading, Message } from "../src/components/StateView";
import { loadFavorites } from "../src/services/favorites";
import { colors } from "../src/constants/theme";
export default function Favorites() {
  const [apps, setApps] = useState(null);
  const load = useCallback(() => loadFavorites().then(setApps), []);

  useEffect(() => {
    load();
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen activeTab="favorite">
      <View style={styles.header}>
        <Text style={styles.brandName}>Appora</Text>
      </View>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>
        Saved only on this device; they do not sync between devices.
      </Text>
      {!apps ? (
        <Loading />
      ) : apps.length ? (
        apps.map((app) => <AppCard key={app.id} app={app} />)
      ) : (
        <Message
          title="No favorites yet"
          message="Open an app listing and tap Save favorite."
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
    marginBottom: 4,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 12,
  },
});
