import { ingredients, recipeById, recipes, tools } from '../src/domain/catalog';
import {
  addDays,
  available,
  completeMeal,
  eligible,
  emptyState,
  planDays,
  purchase,
  recommend,
  requirements,
  saveMeal,
  shoppingList,
  today,
  undoMeal,
  validDate,
  validateProfile,
} from '../src/domain/kitchen';
import { AppState, Meal, Purchase } from '../src/domain/types';

const date = today();
const base = (): AppState => ({
  ...emptyState(),
  onboarded: true,
  profile: {
    ...emptyState().profile,
    postal: '138611',
    storage: 'freezer',
    tools: tools.map((t) => t.id),
  },
});
const meal = (ids = ['oatmeal']): Meal => ({
  id: 'meal1',
  date,
  slot: 'lunch',
  kind: 'home',
  recipeIds: ids,
});
const buy = (
  ingredientId: string,
  size: number,
  expiry: string | null = null,
): Purchase => ({
  ingredientId,
  size,
  packs: 1,
  price: null,
  expiry,
  verified: true,
});

test('catalog contains 58 draft demos with bilingual ingredients, valid references and no retail offers', () => {
  expect(recipes).toHaveLength(58);
  expect(Object.keys(ingredients)).toHaveLength(52);
  for (const r of recipes) {
    expect(r.reviewStatus).toBe('draft');
    expect(r.sourceUrl).toBeNull();
    expect(r.steps.length).toBeGreaterThan(0);
    for (const id of Object.keys(r.ingredients)) {
      expect(ingredients[id].zh).toBeTruthy();
      expect(ingredients[id].en).toBeTruthy();
    }
    r.addons.forEach((id) => expect(recipeById[id].category).toBe('addon'));
  }
});
test('Singapore date is independent of host timezone and date validation rejects rollovers', () => {
  expect(today(new Date('2026-11-03T17:00:00Z'))).toBe('2026-11-04');
  expect(validDate('2026-02-30')).toBe(false);
  expect(validDate('2028-02-29')).toBe(true);
});
test('profile rejects invalid postal, nonfinite budget and negative calories', () => {
  const p = base().profile;
  expect(() => validateProfile({ ...p, postal: '12' })).toThrow();
  expect(() => validateProfile({ ...p, budget: NaN })).toThrow();
  expect(() => validateProfile({ ...p, kcal: -1 })).toThrow();
  expect(() => validateProfile(p)).not.toThrow();
});
test('allergy, unknown processed allergens, equipment and cold storage are hard filters', () => {
  const p = base().profile;
  expect(eligible(recipeById.oatmeal, { ...p, allergens: ['dairy'] })).toBe(
    false,
  );
  expect(eligible(recipeById.luosifen, { ...p, allergens: ['egg'] })).toBe(
    false,
  );
  expect(
    eligible(recipeById['chicken-rice-air'], { ...p, tools: ['air-fryer'] }),
  ).toBe(false);
  expect(eligible(recipeById.oatmeal, { ...p, storage: 'none' })).toBe(false);
  expect(eligible(recipeById.dumplings, { ...p, storage: 'fridge' })).toBe(
    false,
  );
  expect(eligible(recipeById['udon-soup'], { ...p, dislikes: '青菜' })).toBe(
    false,
  );
});
test('selecting and saving a meal never creates stock; package size remains unknown until entered', () => {
  const s = saveMeal(base(), meal());
  expect(s.batches).toHaveLength(0);
  const list = shoppingList(s);
  expect(list.find((x) => x.ingredientId === 'oats')).toMatchObject({
    missing: 50,
    size: null,
    packs: null,
  });
  s.packages.oats = { size: 30, price: null };
  expect(shoppingList(s).find((x) => x.ingredientId === 'oats')?.packs).toBe(2);
});
test('purchase adds only confirmed items and an idempotency key prevents duplicate stock', () => {
  let s = saveMeal(base(), meal());
  s = purchase(s, [buy('oats', 500)], 'buy1');
  expect(available(s, 'oats')).toBe(500);
  expect(available(s, 'milk')).toBe(0);
  expect(purchase(s, [buy('oats', 500)], 'buy1')).toBe(s);
  expect(shoppingList(s).map((x) => x.ingredientId)).toEqual(['milk']);
});
test('purchase validates real package counts, expiry, prices and storage', () => {
  for (const patch of [
    { size: 0 },
    { packs: 1.5 },
    { size: NaN },
    { price: -1 },
    { expiry: '2026-02-30' },
    { expiry: addDays(date, -1) },
  ]) {
    expect(() =>
      purchase(base(), [{ ...buy('oats', 500), ...patch }], 'bad'),
    ).toThrow();
  }
  const s = base();
  s.profile.storage = 'none';
  expect(() => purchase(s, [buy('milk', 1000)], 'bad')).toThrow();
});
test('unverified, expired, discarded or incompatible inventory is not available or consumed', () => {
  let s = purchase(base(), [buy('milk', 1000)], 'p');
  s.batches[0].verified = false;
  expect(available(s, 'milk')).toBe(0);
  s.batches[0].verified = true;
  s.batches[0].expiry = addDays(date, -1);
  expect(available(s, 'milk')).toBe(0);
  s.batches[0].expiry = null;
  s.batches[0].discarded = true;
  expect(available(s, 'milk')).toBe(0);
  s.batches[0].discarded = false;
  s.profile.storage = 'none';
  expect(available(s, 'milk')).toBe(0);
});
test('FEFO consumption splits batches, is atomic and idempotent; undo restores exact batches', () => {
  let s = purchase(base(), [buy('oats', 20, addDays(date, 1))], 'near');
  s = purchase(
    s,
    [buy('oats', 100, addDays(date, 10)), buy('milk', 1000)],
    'later',
  );
  const before = JSON.parse(JSON.stringify(s));
  const done = completeMeal(s, meal());
  expect(done.batches.find((b) => b.id === 'near-0')?.remaining).toBe(0);
  expect(done.batches.find((b) => b.id === 'later-0')?.remaining).toBe(70);
  expect(done.batches.find((b) => b.id === 'later-1')?.remaining).toBe(800);
  expect(s).toEqual(before);
  expect(completeMeal(done, meal())).toBe(done);
  expect(undoMeal(done, 'meal1').batches).toEqual(before.batches);
  expect(done.logs).toHaveLength(1);
});
test('insufficient stock blocks logging without partial deductions', () => {
  const s = purchase(base(), [buy('oats', 500)], 'p');
  const before = JSON.stringify(s);
  expect(() => completeMeal(s, meal())).toThrow('牛奶');
  expect(JSON.stringify(s)).toBe(before);
});
test('completed slots cannot be replaced; future meals cannot be checked in today', () => {
  let s = completeMeal(base(), { ...meal([]), kind: 'outside' });
  expect(() => saveMeal(s, meal())).toThrow('已经打卡');
  expect(() =>
    completeMeal(base(), {
      ...meal([]),
      kind: 'outside',
      date: addDays(date, 1),
    }),
  ).toThrow();
});
test('external meals do not consume stock; undo does not revive discarded food', () => {
  const s = purchase(base(), [buy('oats', 500), buy('milk', 1000)], 'p');
  const done = completeMeal(s, { ...meal([]), kind: 'delivery' });
  expect(done.batches).toEqual(s.batches);
  const cooked = completeMeal(s, meal());
  cooked.batches[0].discarded = true;
  expect(undoMeal(cooked, 'meal1').batches[0].discarded).toBe(true);
});
test('pantry seasonings are required but not deducted each meal', () => {
  let s = base();
  const m = meal(['noodles']);
  const needs = requirements(m.recipeIds);
  s = purchase(
    s,
    Object.entries(needs).map(([id, q]) =>
      buy(id, ingredients[id].persistent ? 1 : q),
    ),
    'p',
  );
  expect(
    completeMeal(s, m).batches.find((b) => b.ingredientId === 'salt')
      ?.remaining,
  ).toBe(1);
});
test('near-expiry safe inventory improves recommendation, expired does not', () => {
  const s = purchase(
    base(),
    [buy('oats', 500, addDays(date, 1)), buy('milk', 1000, addDays(date, 1))],
    'p',
  );
  const choices = recommend(s, 'base', 'breakfast');
  expect(choices.slice(0, 3).some((r) => r.id === 'oatmeal')).toBe(true);
  s.batches.forEach((b) => {
    b.expiry = addDays(date, -1);
  });
  expect(available(s, 'oats')).toBe(0);
});
test('3–7 day planning preserves completed meals and produces shared shopping needs', () => {
  for (const days of [3, 4, 5, 6, 7]) {
    const s = planDays(base(), days);
    expect(s.meals).toHaveLength(days * 3);
    expect(shoppingList(s).length).toBeGreaterThan(0);
    expect(new Set(s.meals.map((m) => `${m.date}:${m.slot}`)).size).toBe(
      days * 3,
    );
  }
  const s = completeMeal(base(), { ...meal([]), kind: 'outside' });
  expect(planDays(s, 3).logs).toEqual(s.logs);
  expect(planDays(s, 3).meals).toHaveLength(8);
  expect(() => planDays(base(), 2)).toThrow();
});
test('shopping does not count food that expires before the planned date', () => {
  let s = purchase(base(), [buy('oats', 500, date)], 'p');
  s = saveMeal(s, { ...meal(), date: addDays(date, 1) });
  expect(shoppingList(s).find((x) => x.ingredientId === 'oats')?.missing).toBe(
    50,
  );
});
test('shopping reserves soon-expiring food for early meals instead of double-counting or wasting it', () => {
  let s = purchase(base(), [buy('oats', 50, date)], 'p');
  s = saveMeal(s, meal());
  s = saveMeal(s, { ...meal(), id: 'tomorrow', date: addDays(date, 1) });
  expect(shoppingList(s).find((x) => x.ingredientId === 'oats')).toMatchObject({
    needed: 100,
    owned: 50,
    missing: 50,
  });
});
test('shopping asks for one persistent condiment, not a bottle for every planned meal', () => {
  let s = saveMeal(base(), meal(['noodles']));
  s = saveMeal(s, {
    ...meal(['noodles']),
    id: 'tomorrow',
    date: addDays(date, 1),
  });
  expect(shoppingList(s).find((x) => x.ingredientId === 'salt')?.missing).toBe(
    1,
  );
});
