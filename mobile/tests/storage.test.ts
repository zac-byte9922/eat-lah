import { emptyState, completeMeal, today } from '../src/domain/kitchen';
import {
  KitchenSession,
  LocalKitchenRepository,
  STORAGE_KEY,
} from '../src/storage/repository';
const memory = () => {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: async (key: string) => data[key] ?? null,
    setItem: async (key: string, value: string) => {
      data[key] = value;
    },
  };
};
test('full state survives a repository restart', async () => {
  const storage = memory();
  const repository = new LocalKitchenRepository(storage);
  const s = emptyState();
  s.profile.postal = '138611';
  s.favorites.push('oatmeal');
  await repository.save(s);
  expect(await new LocalKitchenRepository(storage).load()).toEqual(s);
});
test('corrupt or incompatible state is retained, never silently overwritten', async () => {
  const storage = memory();
  storage.data[STORAGE_KEY] = '{broken';
  await expect(new LocalKitchenRepository(storage).load()).rejects.toThrow(
    '原始资料已保留',
  );
  expect(storage.data[STORAGE_KEY]).toBe('{broken');
});
test('racing completion commands serialize and write once', async () => {
  const storage = memory();
  const repo = new LocalKitchenRepository(storage);
  const spy = jest.spyOn(repo, 'save');
  const session = new KitchenSession(repo);
  await session.load();
  const m = {
    id: 'one',
    date: today(),
    slot: 'lunch' as const,
    kind: 'outside' as const,
    recipeIds: [],
  };
  const [a, b] = await Promise.all([
    session.update((s) => completeMeal(s, m)),
    session.update((s) => completeMeal(s, m)),
  ]);
  expect(a.logs).toHaveLength(1);
  expect(b.logs).toHaveLength(1);
  expect(spy).toHaveBeenCalledTimes(1);
});
test('failed persistence is not published; later commands recover', async () => {
  const storage = memory();
  const repo = new LocalKitchenRepository(storage);
  const session = new KitchenSession(repo);
  await session.load();
  const save = jest
    .spyOn(repo, 'save')
    .mockRejectedValueOnce(new Error('disk full'));
  await expect(
    session.update((s) => ({ ...s, onboarded: true })),
  ).rejects.toThrow('disk full');
  const next = await session.update((s) => ({ ...s, favorites: ['oatmeal'] }));
  expect(next.onboarded).toBe(false);
  expect(save).toHaveBeenCalledTimes(2);
});
