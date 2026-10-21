import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/theme";

const navItems = [
  { id: "recent", label: "Recent", icon: "◉", route: "/" },
  { id: "category", label: "Category", icon: "▣", route: "/categories" },
  { id: "favorite", label: "Favorite", icon: "★", route: "/favorites" },
];

export default function Screen({
  children,
  contentContainerStyle,
  activeTab,
  ...props
}) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
      {activeTab && (
        <View style={styles.bottomNavWrap}>
          <View style={styles.bottomNav}>
            {navItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => router.push(item.route)}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                >
                  <Text
                    style={[styles.navIcon, isActive && styles.navIconActive]}
                  >
                    {item.icon}
                  </Text>
                  <Text
                    style={[styles.navLabel, isActive && styles.navLabelActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 18, gap: 14, paddingBottom: 110 },
  bottomNavWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 8,
    backgroundColor: "rgba(248, 250, 252, 0.94)",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#dfe7f5",
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 112,
  },
  navItemActive: { backgroundColor: "#dbeafe" },
  navIcon: { fontSize: 22, color: colors.muted },
  navIconActive: { color: colors.brand },
  navLabel: {
    fontSize: 11,
    marginTop: 2,
    color: colors.muted,
    fontWeight: "700",
  },
  navLabelActive: { color: colors.brand },
});
