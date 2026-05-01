// components/NewsFeed.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTrends from '@/hooks/trends/useTrends';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getCategoryStyle = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'real estate':
      return {
        tagColor: '#E6F1FB',
        tagTextColor: '#0C447C',
        icon: 'business-outline',
        iconColor: '#185FA5',
      };
    case 'market':
      return {
        tagColor: '#E1F5EE',
        tagTextColor: '#085041',
        icon: 'trending-up',
        iconColor: '#0F6E56',
      };
    default:
      return {
        tagColor: '#EEEDFE',
        tagTextColor: '#3C3489',
        icon: 'book-outline',
        iconColor: '#534AB7',
      };
  }
};

const NewsFeed: React.FC = () => {
  const { posts, loading, incrementViews } = useTrends();

  const router = useRouter();

  const latestPosts = posts.slice(0, 3);

  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading news...</Text>
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.container}>
        <Text>No news available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Helpful Articles
        </Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(trends)')}>
          <Text style={[styles.seeAll, { color: colors.text.primary }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {latestPosts.map((item) => {
        const style = getCategoryStyle(item.category);

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[
              styles.newsCard,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
            onPress={() => {
              router.push({
                pathname: '/(app)/(trends)/[slug]',
                params: { slug: item.slug },
              });
              incrementViews(item.slug);
            }}
          >
            <View style={styles.newsContent}>
              <View style={styles.tagContainer}>
                <View style={[styles.tag, { backgroundColor: style.tagColor }]}>
                  <Text style={[styles.tagText, { color: style.tagTextColor }]}>
                    {item.category}
                  </Text>
                </View>
                <Text
                  style={[styles.timeText, { color: colors.text.secondary }]}
                >
                  {formatTimeAgo(item.date_created)}
                </Text>
              </View>

              <Text
                style={[styles.newsTitle, { color: colors.text.secondary }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>

            <View style={[styles.iconBox, { backgroundColor: style.tagColor }]}>
              <Ionicons
                name={style.icon as any}
                size={20}
                color={style.iconColor}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  seeAll: {
    fontSize: 14,
    color: '#185FA5',
  },
  newsCard: {
    flexDirection: 'row',

    borderWidth: 0.5,

    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  newsContent: {
    flex: 1,
    marginRight: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
  },
  newsTitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

export default NewsFeed;
