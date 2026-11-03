import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  GestureResponderEvent,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Recipe } from '../domain/types';
import { Button, colors, Note, Row, s } from './ui';

export function SwipeCard({
  recipe,
  onAccept,
  onReject,
  favorite,
  onFavorite,
}: {
  recipe: Recipe;
  onAccept: () => void;
  onReject: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const [position] = useState(() => new Animated.ValueXY());
  const { width } = useWindowDimensions();
  const [animating, setAnimating] = useState(false);
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
    return () => {
      position.stopAnimation();
    };
  }, [recipe.id, position]);
  const threshold = Math.min(width * 0.22, 100);
  const shouldMove = useCallback(
    (_: GestureResponderEvent, g: PanResponderGestureState) =>
      !animating &&
      Math.abs(g.dx) > 12 &&
      Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
    [animating],
  );
  const move = useCallback(
    (_: GestureResponderEvent, g: PanResponderGestureState) =>
      position.setValue({ x: g.dx, y: g.dy * 0.08 }),
    [position],
  );
  const release = useCallback(
    (_: GestureResponderEvent, g: PanResponderGestureState) => {
      if (Math.abs(g.dx) >= threshold) {
        setAnimating(true);
        Animated.timing(position, {
          toValue: { x: g.dx > 0 ? width : -width, y: 0 },
          duration: 180,
          useNativeDriver: true,
        }).start(({ finished }) => {
          position.setValue({ x: 0, y: 0 });
          setAnimating(false);
          if (finished) (g.dx > 0 ? onAccept : onReject)();
        });
      } else
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
    },
    [position, threshold, width, onAccept, onReject],
  );
  const terminate = useCallback(
    () =>
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start(),
    [position],
  );
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: shouldMove,
        onPanResponderMove: move,
        onPanResponderRelease: release,
        onPanResponderTerminate: terminate,
      }),
    [shouldMove, move, release, terminate],
  );
  return (
    <View style={{ gap: 12 }}>
      <Animated.View
        testID="swipe-card"
        {...pan.panHandlers}
        style={[
          s.card,
          {
            backgroundColor: colors.pale,
            minHeight: 300,
            transform: [
              ...position.getTranslateTransform(),
              {
                rotate: position.x.interpolate({
                  inputRange: [-250, 0, 250],
                  outputRange: ['-9deg', '0deg', '9deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={{ fontSize: 76, textAlign: 'center', padding: 12 }}>
          {recipe.emoji}
        </Text>
        <Text style={s.title}>{recipe.zh}</Text>
        <Text style={s.muted}>
          {recipe.en} · 约 {recipe.minutes} 分钟
        </Text>
        <Note>演示食谱 · 尚未经厨房实测</Note>
        <Button
          title={favorite ? '♥ 已收藏' : '♡ 收藏'}
          secondary
          disabled={animating}
          onPress={onFavorite}
        />
      </Animated.View>
      <Row>
        <Button
          title="换一个"
          secondary
          disabled={animating}
          onPress={onReject}
        />
        <Button title="就这个" disabled={animating} onPress={onAccept} />
      </Row>
      <Note>向左滑换一个，向右滑保留。也可使用按钮。</Note>
    </View>
  );
}
