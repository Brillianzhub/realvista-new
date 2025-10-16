import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    useColorScheme,
    Image,
    TouchableOpacity,
    Share,
    useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';


type PostDetail = {
    id: number;
    title: string;
    body: string;
    attachment: string | null;
    date_created: string;
    source: string;
    category: string;
    views: number;
    publish: boolean;
};

export default function PostDetail() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();

    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [webViewHeight, setWebViewHeight] = useState(400);
    const [heightStabilized, setHeightStabilized] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchPostDetail();
        }
    }, [slug]);

    useEffect(() => {
        if (webViewHeight > 400) {
            const timer = setTimeout(() => {
                setHeightStabilized(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [webViewHeight]);

    const fetchPostDetail = async () => {
        try {
            setError(null);


            const response = await fetch(
                `https://www.realvistamanagement.com/trends/reports/${slug}/`,
                {
                    method: 'GET',

                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Post not found');
                } else {
                    throw new Error('Failed to fetch post');
                }
                return;
            }

            const data: PostDetail = await response.json();
            setPost(data);
        } catch (err: any) {
            console.error('Error fetching post:', err);
            setError('Failed to load post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${post?.title}\n\nRead more: https://realvistaproperties.com/trend/${slug}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const getHtmlContent = (htmlBody: string) => {
        const backgroundColor = isDark ? '#111827' : '#FFFFFF';
        const textColor = isDark ? '#E5E7EB' : '#374151';
        const headingColor = isDark ? '#F9FAFB' : '#111827';
        const linkColor = '#FB902E';
        const blockquoteBg = isDark ? '#374151' : '#FFF7ED';

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: ${textColor};
              background-color: ${backgroundColor};
              padding: 0;
              margin: 0;
            }
            h1, h2, h3, h4, h5, h6 {
              font-size: 24px;
              color: ${headingColor};
              font-weight: 700;
              margin-top: 0px;
              margin-bottom: 12px;
              line-height: 1.3;
            }
            h2 {
              font-size: 24px;
            }
            h3 {
              font-size: 20px;
              font-weight: 600;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 16px;
              line-height: 1.7;
            }
            strong, b {
              font-weight: 700;
              color: ${headingColor};
            }
            em, i {
              font-style: italic;
            }
            a {
              color: ${linkColor};
              text-decoration: underline;
            }
            ul, ol {
              margin-bottom: 16px;
              padding-left: 24px;
            }
            li {
              margin-bottom: 8px;
              line-height: 1.6;
            }
            blockquote {
              background-color: ${blockquoteBg};
              border-left: 4px solid ${linkColor};
              padding: 12px 16px;
              margin: 16px 0;
              font-style: italic;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 16px 0;
            }
            code {
              background-color: ${isDark ? '#374151' : '#F3F4F6'};
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
            pre {
              background-color: ${isDark ? '#374151' : '#F3F4F6'};
              padding: 16px;
              border-radius: 8px;
              overflow-x: auto;
              margin: 16px 0;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid ${isDark ? '#374151' : '#E5E7EB'};
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: ${isDark ? '#374151' : '#F9FAFB'};
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          ${htmlBody}
        </body>
      </html>
    `;
    };

    if (loading) {
        return (
            <View style={[styles.centered, isDark && styles.centeredDark]}>
                <ActivityIndicator size="large" color="#FB902E" />
                <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                    Loading post...
                </Text>
            </View>
        );
    }

    if (error || !post) {
        return (
            <View style={[styles.centered, isDark && styles.centeredDark]}>
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color={isDark ? '#EF4444' : '#F87171'}
                />
                <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                    {error || 'Post not found'}
                </Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                {/* <TouchableOpacity
                    style={[styles.headerButton, isDark && styles.headerButtonDark]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
                </TouchableOpacity> */}

                <TouchableOpacity
                    style={[styles.headerButton, isDark && styles.headerButtonDark]}
                    onPress={handleShare}
                >
                    <Ionicons name="share-outline" size={24} color={isDark ? '#F9FAFB' : '#111827'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {post.attachment && (
                    <Image
                        source={{ uri: post.attachment }}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.content}>
                    {post.category && (
                        <View style={styles.categoryContainer}>
                            <Text style={styles.category}>{post.category}</Text>
                        </View>
                    )}

                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        {post.title}
                    </Text>

                    <View style={styles.metadata}>
                        <View style={styles.metadataItem}>
                            <Ionicons
                                name="person-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                                {post.source}
                            </Text>
                        </View>

                        <View style={styles.metadataItem}>
                            <Ionicons
                                name="calendar-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                                {formatDate(post.date_created)}
                            </Text>
                        </View>

                        <View style={styles.metadataItem}>
                            <Ionicons
                                name="eye-outline"
                                size={16}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                            <Text style={[styles.metadataText, isDark && styles.metadataTextDark]}>
                                {post.views} views
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={[styles.webViewContainer, { height: webViewHeight }]}>
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: getHtmlContent(post.body) }}
                            style={styles.webView}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            onMessage={(event) => {
                                if (heightStabilized) return;

                                const height = Number(event.nativeEvent.data);
                                if (height && height > 0 && height !== webViewHeight - 50) {
                                    setWebViewHeight(height + 50);
                                }
                            }}
                            injectedJavaScript={`
                (function() {
                  let lastHeight = 0;
                  let stableCount = 0;

                  function sendHeight() {
                    const height = Math.max(
                      document.documentElement.scrollHeight,
                      document.body.scrollHeight,
                      document.documentElement.offsetHeight,
                      document.body.offsetHeight
                    );

                    if (height === lastHeight) {
                      stableCount++;
                      if (stableCount >= 3) {
                        return;
                      }
                    } else {
                      stableCount = 0;
                      lastHeight = height;
                    }

                    window.ReactNativeWebView.postMessage(String(height));
                  }

                  sendHeight();
                  setTimeout(sendHeight, 300);
                  setTimeout(sendHeight, 800);
                  setTimeout(sendHeight, 1500);
                })();
                true;
              `}
                            onShouldStartLoadWithRequest={(request) => {
                                return true;
                            }}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
    },
    centeredDark: {
        backgroundColor: '#111827',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    loadingTextDark: {
        color: '#9CA3AF',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
    },
    errorTextDark: {
        color: '#E5E7EB',
    },
    backButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FB902E',
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerButtonDark: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    coverImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 24,
    },
    categoryContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 16,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FB902E',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 36,
        marginBottom: 16,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    metadata: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metadataText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    metadataTextDark: {
        color: '#9CA3AF',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 24,
    },
    webViewContainer: {
        minHeight: 400,
        overflow: 'hidden',
    },
    webView: {
        backgroundColor: 'transparent',
    },
});
