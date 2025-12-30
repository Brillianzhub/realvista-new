import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import YoutubePlayer, { PLAYER_STATES } from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
  width?: DimensionValue;
  autoPlay?: boolean;
  mute?: boolean;
  showControls?: boolean;
  showFullScreenButton?: boolean;
  onStateChange?: (state: PLAYER_STATES) => void;
  onReady?: () => void;
  onError?: (error: string) => void;
  containerStyle?: object;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  height = 220,
  width = '100%',
  autoPlay = false,
  mute = false,
  showControls = true,
  showFullScreenButton = true,
  onStateChange,
  onReady,
  onError,
  containerStyle,
}) => {
  if (!videoId) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <YoutubePlayer
        height={height}
        width={width}
        videoId={videoId}
        play={autoPlay}
        mute={mute}
        onChangeState={onStateChange}
        onReady={onReady}
        onError={onError}
        playerParams={{
          controls: showControls ? 1 : 0,
          preventFullScreen: !showFullScreenButton,
          rel: 0,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default YouTubePlayer;
