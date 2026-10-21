import { useCallback, useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Screen from '../../src/components/Screen';
import { Loading, Message } from '../../src/components/StateView';
import { apiMessage, getApp, recordEvent } from '../../src/services/api';
import { isFavorite, toggleFavorite } from '../../src/services/favorites';
import { colors } from '../../src/constants/theme';

export default function AppDetails() {
  const { id } = useLocalSearchParams();
  const [app, setApp] = useState(null);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const current = await getApp(id);
      setApp(current);
      setFavorite(await isFavorite(current.id));
      recordEvent(current.id, 'detail_view');
    } catch (reason) {
      setError(apiMessage(reason));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (app) {
        isFavorite(app.id).then(setFavorite);
      }
    }, [app])
  );

  async function save() {
    setFavorite(await toggleFavorite(app));
  }

  async function playStore() {
    const canOpen = await Linking.canOpenURL(app.play_store_url);
    if (!canOpen) return setError('This Google Play link cannot be opened on this device.');
    await Linking.openURL(app.play_store_url);
    recordEvent(app.id, 'play_store_click');
  }

  if (error) return <Screen><Message title="Couldn't open this app" message={error} onRetry={load} /></Screen>;
  if (!app) return <Screen><Loading /></Screen>;

  return (
    <Screen>
      <View style={styles.hero}>
        {app.poster_url ? (
          <Image style={styles.poster} source={{ uri: app.poster_url }} />
        ) : (
          <View style={styles.posterPlaceholder} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{app.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.code}>{app.search_code}</Text>
          <Text style={styles.category}>{app.categories?.name || 'Uncategorized'}</Text>
        </View>
        {app.developer_name && <Text style={styles.developer}>By {app.developer_name}</Text>}
        
        <Text style={styles.short}>{app.short_description || app.description}</Text>
        <Text style={styles.description}>{app.description}</Text>

        <Pressable style={styles.play} onPress={playStore}>
          <Text style={styles.playText}>View on Google Play</Text>
        </Pressable>
        
        <Pressable style={styles.favorite} onPress={save}>
          <Text style={styles.favoriteText}>{favorite ? '★ Saved to favorites' : '☆ Save favorite'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 20,
  },
  poster: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  posterPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
  },
  content: {
    gap: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  code: {
    color: colors.brand,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 14,
  },
  category: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  developer: {
    color: colors.muted,
    fontSize: 14,
  },
  short: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.ink,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  play: {
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.brand,
    padding: 16,
    marginTop: 8,
  },
  playText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  favorite: {
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    padding: 14,
  },
  favoriteText: {
    color: '#3730a3',
    fontWeight: '700',
  },
});
