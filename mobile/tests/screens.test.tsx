import React from 'react';
import { Text } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { KitchenProvider, useKitchen } from '../src/storage/context';
import { STORAGE_KEY } from '../src/storage/repository';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { ChooseScreen } from '../src/screens/ChooseScreen';
import { ShoppingScreen } from '../src/screens/ShoppingScreen';
import { CookScreen } from '../src/screens/CookScreen';
import { HistoryScreen } from '../src/screens/HistoryScreen';
import { PantryScreen } from '../src/screens/PantryScreen';
import { emptyState, today } from '../src/domain/kitchen';
import { AppState } from '../src/domain/types';
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
const params = useLocalSearchParams as jest.Mock;
function Harness({ component: Component }: { component: React.ComponentType }) {
  const { state } = useKitchen();
  return state ? <Component /> : <Text>Loading</Text>;
}
const tree = (Component: React.ComponentType) => (
  <KitchenProvider>
    <Harness component={Component} />
  </KitchenProvider>
);
const read = async (): Promise<AppState> =>
  JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  params.mockReturnValue({ slot: 'lunch' });
});

test('native onboarding validates postcode and persists profile, tools and preferences', async () => {
  await render(tree(ProfileScreen));
  await screen.findByText('先认识你的厨房');
  await fireEvent.press(screen.getByRole('button', { name: '下一步' }));
  expect(screen.getByText('请填写 6 位邮编。')).toBeTruthy();
  await fireEvent.changeText(
    screen.getByLabelText('新加坡邮编（6 位）'),
    '138611',
  );
  await fireEvent.press(screen.getByRole('button', { name: '下一步' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: 'S$110' }));
  await fireEvent.press(screen.getByRole('button', { name: '下一步' }));
  await fireEvent.press(
    screen.getByRole('checkbox', { name: '花生 / Peanut' }),
  );
  await fireEvent.press(screen.getByRole('button', { name: '下一步' }));
  await fireEvent.press(screen.getByRole('button', { name: '好了，开始吃饭' }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  const s = await read();
  expect(s.onboarded).toBe(true);
  expect(s.profile.postal).toBe('138611');
  expect(s.profile.budget).toBe(110);
  expect(s.profile.allergens).toContain('peanut');
});

test('native home → lazy card → shopping → cooking → check-in with actual persistent storage', async () => {
  const initial = emptyState();
  initial.onboarded = true;
  initial.profile.postal = '138611';
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  const view = await render(tree(HomeScreen));
  await screen.findByText('今天吃哪一顿？');
  await fireEvent.press(screen.getByRole('button', { name: '选择午餐' }));
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/choose',
    params: { slot: 'lunch' },
  });
  await view.rerender(tree(ChooseScreen));
  await fireEvent.press(screen.getByRole('button', { name: '今天省点事' }));
  await fireEvent.press(screen.getByRole('button', { name: '在家吃' }));
  expect(screen.getByTestId('swipe-card')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: '♡ 收藏' }));
  await waitFor(async () => expect((await read()).favorites).toHaveLength(1));
  await fireEvent.press(screen.getByRole('button', { name: '就这个' }));
  await fireEvent.press(
    screen.getByRole('button', { name: '确认，查看购物清单' }),
  );
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/shopping'));
  let s = await read();
  expect(s.batches).toHaveLength(0);
  expect(s.meals).toHaveLength(1);
  await view.rerender(tree(ShoppingScreen));
  const sizes = screen.getAllByLabelText(/每包实际含量/);
  for (const input of sizes) await fireEvent.changeText(input, '1000');
  for (const input of screen.getAllByLabelText('实际买到几包'))
    await fireEvent.changeText(input, '1');
  for (const checkbox of screen.getAllByRole('checkbox', {
    name: '已核对包装过敏原、有效期和储存要求',
  }))
    await fireEvent.press(checkbox);
  for (const checkbox of screen.getAllByRole('checkbox', {
    name: '这件我实际买到了',
  }))
    await fireEvent.press(checkbox);
  await fireEvent.press(
    screen.getByRole('button', { name: '确认实际购买并入库' }),
  );
  await waitFor(() =>
    expect(
      screen.getByText(
        '当前计划无需补购。请检查库存包装和安全状态后开始做饭。',
      ),
    ).toBeTruthy(),
  );
  s = await read();
  expect(s.batches.length).toBeGreaterThan(0);
  expect(s.logs).toHaveLength(0);
  params.mockReturnValue({ id: s.meals[0].id });
  await view.rerender(tree(CookScreen));
  while (
    !screen.getByRole('button', { name: '下一步' }).props.accessibilityState
      .disabled
  )
    await fireEvent.press(screen.getByRole('button', { name: '下一步' }));
  await fireEvent.press(
    screen.getByRole('button', { name: '完成这顿 · 打卡并扣库存' }),
  );
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/history'));
  const done = await read();
  expect(done.logs).toHaveLength(1);
  expect(done.logs[0].slot).toBe('lunch');
  expect(
    done.batches.some(
      (b) => b.remaining < s.batches.find((x) => x.id === b.id)!.remaining,
    ),
  ).toBe(true);
  await view.rerender(tree(HistoryScreen));
  expect(screen.getByRole('button', { name: '撤销这次打卡' })).toBeTruthy();
  await view.rerender(tree(PantryScreen));
  expect(screen.getByText('我的厨房')).toBeTruthy();
  await view.unmount();
  await render(tree(HistoryScreen));
  await screen.findByText('今天吃了吗？');
  expect(screen.getByRole('button', { name: '撤销这次打卡' })).toBeTruthy();
});

test('native cooking path enforces meal → effort → mood → single card and optional sides', async () => {
  const initial = emptyState();
  initial.onboarded = true;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  await render(tree(ChooseScreen));
  await screen.findByText('午餐 · 今天想怎么吃？');
  await fireEvent.press(screen.getByRole('button', { name: '我想做点' }));
  expect(screen.getByText('午餐 · 想吃哪种？')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: '普通' }));
  expect(screen.getByText('午餐 · 选这顿的主食')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: '换一个' }));
  await fireEvent.press(screen.getByRole('button', { name: '撤销上次划走' }));
  await fireEvent.press(screen.getByRole('button', { name: '就这个' }));
  expect(screen.getByText('午餐 · 要搭一道菜吗？')).toBeTruthy();
  await fireEvent.press(
    screen.getByRole('button', { name: '不加，跳过这一步' }),
  );
  await fireEvent.press(
    screen.getByRole('button', { name: '不加，跳过这一步' }),
  );
  expect(screen.getByText('午餐 · 选好了')).toBeTruthy();
});

test('native external meal path records without inventing stock', async () => {
  const initial = emptyState();
  initial.onboarded = true;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  await render(tree(ChooseScreen));
  await screen.findByText('午餐 · 今天想怎么吃？');
  await fireEvent.press(screen.getByRole('button', { name: '今天省点事' }));
  await fireEvent.press(screen.getByRole('button', { name: '出去吃' }));
  await fireEvent.press(
    screen.getByRole('button', { name: '这顿吃好了，记录一下' }),
  );
  await waitFor(async () => expect((await read()).logs).toHaveLength(1));
  const s = await read();
  expect(s.batches).toHaveLength(0);
  expect(s.logs[0].date).toBe(today());
  expect(s.logs[0].kind).toBe('outside');
});
