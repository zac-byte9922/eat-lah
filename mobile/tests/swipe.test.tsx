import React from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  PanResponderCallbacks,
  PanResponderGestureState,
} from 'react-native';
import { act, render } from '@testing-library/react-native';
import { SwipeCard } from '../src/components/SwipeCard';
import { recipeById } from '../src/domain/catalog';

test('native swipe accepts right, rejects left and ignores vertical/small movement', async () => {
  let handlers: PanResponderCallbacks = {};
  const realCreate = PanResponder.create;
  const create = jest
    .spyOn(PanResponder, 'create')
    .mockImplementation((config) => {
      handlers = config;
      return realCreate(config);
    });
  const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
    start: (cb) => cb?.({ finished: true }),
    stop() {},
    reset() {},
  });
  const onAccept = jest.fn(),
    onReject = jest.fn();
  try {
    await render(
      <SwipeCard
        recipe={recipeById.oatmeal}
        onAccept={onAccept}
        onReject={onReject}
        onFavorite={() => {}}
        favorite={false}
      />,
    );
    const event = {} as GestureResponderEvent;
    const gesture = (dx: number, dy = 0) =>
      ({ dx, dy }) as PanResponderGestureState;
    expect(handlers.onMoveShouldSetPanResponder!(event, gesture(5))).toBe(
      false,
    );
    expect(handlers.onMoveShouldSetPanResponder!(event, gesture(20, 100))).toBe(
      false,
    );
    expect(handlers.onMoveShouldSetPanResponder!(event, gesture(140))).toBe(
      true,
    );
    await act(() => handlers.onPanResponderRelease!(event, gesture(140)));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
    await act(() => handlers.onPanResponderRelease!(event, gesture(-140)));
    expect(onReject).toHaveBeenCalledTimes(1);
  } finally {
    create.mockRestore();
    timing.mockRestore();
  }
});
