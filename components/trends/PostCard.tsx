import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PostCardProps = {
  id: string;
  title: string;
  excerpt: string;
  thumbnail?: string;
  publishedDate: string;
  category?: string;
  onPress: () => void;
};

const BRAND = '#358B8B';
const BRAND_LIGHT = '#DAEEF0';
const ACCENT = '#efa968';

export default function PostCard({
  title,
  excerpt,
  thumbnail,
  publishedDate,
  category,
  onPress,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        /* Placeholder banner when no image */
        <View
          style={[
            styles.thumbnailPlaceholder,
            isDark && styles.thumbnailPlaceholderDark,
          ]}
        >
          <Ionicons
            name="image-outline"
            size={32}
            color={isDark ? '#2A5555' : '#A8D4D4'}
          />
        </View>
      )}

      <View style={styles.content}>
        {/* Category pill */}
        {category && (
          <View
            style={[styles.categoryPill, isDark && styles.categoryPillDark]}
          >
            <Text
              style={[styles.categoryText, isDark && styles.categoryTextDark]}
            >
              {category}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text
          style={[styles.title, isDark && styles.titleDark]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Excerpt */}
        <Text
          style={[styles.excerpt, isDark && styles.excerptDark]}
          numberOfLines={3}
        >
          {excerpt}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dateRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color={isDark ? '#6AABAB' : '#5A8A8A'}
            />
            <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
              {formatDate(publishedDate)}
            </Text>
          </View>

          <View style={styles.readMoreRow}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Ionicons name="arrow-forward" size={13} color={ACCENT} />
          </View>
        </View>
      </View>

      {/* Left accent bar */}
      <View style={styles.accentEdge} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20, // ← owns its own horizontal margin
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#DAEEF0',
    // subtle shadow
    shadowColor: '#358B8B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#112626',
    borderColor: '#1A3535',
    shadowColor: '#000',
  },

  // ── Thumbnail ─────────────────────────────────────────────────────────────
  thumbnail: {
    width: '100%',
    height: 190,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#EAF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderDark: {
    backgroundColor: '#0D2020',
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  content: {
    padding: 16,
  },

  // ── Category pill ─────────────────────────────────────────────────────────
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DAEEF0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryPillDark: {
    backgroundColor: '#1A3535',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2A6F6F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTextDark: {
    color: '#7ABFBF',
  },

  // ── Title ─────────────────────────────────────────────────────────────────
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D2626',
    marginBottom: 8,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  titleDark: {
    color: '#E8F5F5',
  },

  // ── Excerpt ───────────────────────────────────────────────────────────────
  excerpt: {
    fontSize: 13,
    color: '#5A8A8A',
    lineHeight: 19,
    marginBottom: 14,
  },
  excerptDark: {
    color: '#6AABAB',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#DAEEF0',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#5A8A8A',
    fontWeight: '500',
  },
  dateTextDark: {
    color: '#6AABAB',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#efa968',
  },

  // ── Left accent edge ──────────────────────────────────────────────────────
  accentEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#358B8B',
  },
});
