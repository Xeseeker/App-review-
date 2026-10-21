import { useEffect, useState } from "react";
import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/theme";
import { isFavorite, toggleFavorite } from "../services/favorites";

export default function AppCard({ app, compact = false }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    isFavorite(app.id).then((result) => {
      if (active) setSaved(result);
    });
    return () => {
      active = false;
    };
  }, [app.id]);

  async function handleFavorite(event) {
    event?.stopPropagation?.();
    const nextValue = await toggleFavorite(app);
    setSaved(nextValue);
  }

  async function handleShare(event) {
    event?.stopPropagation?.();
    const message = `${app.name} — ${app.short_description || app.description || "Check this app out."}`;
    await Share.share({ message });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${app.name}`}
      onPress={() => router.push(`/app-details/${app.id}`)}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      {app.poster_url ? (
        <Image source={{ uri: app.poster_url }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {app.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>
          {app.name}
        </Text>
        <Text style={styles.code}>{app.search_code}</Text>
        {!compact && (
          <Text numberOfLines={2} style={styles.description}>
            {app.short_description || app.description}
          </Text>
        )}

        <View style={styles.actions}>
          <Pressable
            onPress={handleFavorite}
            style={[styles.actionButton, saved && styles.actionButtonActive]}
          >
            <Text style={[styles.actionText, saved && styles.actionTextActive]}>
              {saved ? "★ Saved" : "☆ Favorite"}
            </Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.actionButton}>
            <Text style={styles.actionText}>↗ Share</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
  },
  compact: { width: 260 },
  pressed: { opacity: 0.75 },
  poster: { width: 72, height: 72, borderRadius: 14, backgroundColor: "#ddd" },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e7ff",
  },
  placeholderText: { fontSize: 30, fontWeight: "700", color: colors.brand },
  copy: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },
  code: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  description: { color: colors.muted, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 8, marginTop: 6 },
  actionButton: {
    borderRadius: 999,
    backgroundColor: "#edf2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionButtonActive: { backgroundColor: "#ede9fe" },
  actionText: { fontSize: 12, color: "#312e81", fontWeight: "700" },
  actionTextActive: { color: "#4f46e5" },
});
