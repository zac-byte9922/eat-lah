import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';
import { emptyState } from '../src/domain/kitchen';
import { STORAGE_KEY } from '../src/storage/repository';

beforeEach(async () => {
  await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());
test('real Expo Router protects private screens before onboarding', async () => {
  await renderRouter('./src/app', { initialUrl: '/shopping' });
  await screen.findByText('先认识你的厨房');
  expect(screen).toHavePathname('/onboarding');
});
test('real native tabs and stack navigate from home through meal selection and back', async () => {
  const s = emptyState();
  s.onboarded = true;
  s.profile.postal = '138611';
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  await renderRouter('./src/app', { initialUrl: '/' });
  await screen.findByText('今天吃哪一顿？');
  await fireEvent.press(screen.getByRole('button', { name: '选择晚餐' }));
  await screen.findByText('晚餐 · 今天想怎么吃？');
  expect(screen).toHavePathname('/choose');
  await fireEvent.press(screen.getByRole('button', { name: '今天省点事' }));
  await fireEvent.press(screen.getByRole('button', { name: '点外卖' }));
  await fireEvent.press(
    screen.getByRole('button', { name: '这顿吃好了，记录一下' }),
  );
  await screen.findByText('今天吃了吗？');
  await waitFor(() => expect(screen).toHavePathname('/history'));
  expect(screen.getByRole('button', { name: '撤销这次打卡' })).toBeTruthy();
});
