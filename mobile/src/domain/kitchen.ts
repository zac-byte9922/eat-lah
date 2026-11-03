import { ingredients, recipeById, recipes } from './catalog';
import {
  AppState,
  Batch,
  Category,
  Meal,
  Mood,
  Profile,
  Purchase,
  Recipe,
  ShoppingLine,
  Slot,
} from './types';

export function today(now = new Date()): string {
  // Singapore is UTC+8 year round; independent of the phone's locale/timezone.
  return new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);
}
export function addDays(date: string, n: number) {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
export const defaultProfile = (): Profile => ({
  postal: '',
  tools: ['electric-pot', 'microwave'],
  storage: 'fridge',
  allergens: [],
  dislikes: '',
  tastes: ['savory'],
  budget: 70,
  kcal: 0,
});
export const emptyState = (): AppState => ({
  version: 1,
  profile: defaultProfile(),
  onboarded: false,
  batches: [],
  meals: [],
  logs: [],
  favorites: [],
  packages: {},
  purchases: [],
});
export function validateProfile(p: Profile) {
  if (!/^\d{6}$/.test(p.postal)) throw new Error('请输入 6 位新加坡邮编。');
  if (!Number.isFinite(p.budget) || p.budget < 0 || p.budget > 9999)
    throw new Error('每周预算应为 0–9999 新元。');
  if (!Number.isFinite(p.kcal) || p.kcal < 0 || p.kcal > 3000)
    throw new Error('热量参考应为 0–3000；0 表示不限制。');
}
export const validDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(date)) &&
  new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) === date;
export function compatibleStorage(storage: string, profile: Profile) {
  return (
    storage === 'dry' ||
    (storage === 'chilled' && profile.storage !== 'none') ||
    (storage === 'frozen' && profile.storage === 'freezer')
  );
}
export function usable(batch: Batch, profile: Profile, date = today()) {
  return (
    batch.remaining > 0 &&
    batch.verified &&
    !batch.discarded &&
    (!batch.expiry || batch.expiry >= date) &&
    compatibleStorage(ingredients[batch.ingredientId].storage, profile)
  );
}
export function available(
  state: AppState,
  ingredientId: string,
  date = today(),
) {
  const batches = state.batches.filter(
    (b) => b.ingredientId === ingredientId && usable(b, state.profile, date),
  );
  return ingredients[ingredientId].persistent
    ? batches.length
      ? Infinity
      : 0
    : batches.reduce((n, b) => n + b.remaining, 0);
}
export function eligible(recipe: Recipe, profile: Profile) {
  if (
    !recipe.toolOptions.some((option) =>
      option.every((t) => profile.tools.includes(t)),
    )
  )
    return false;
  const terms = profile.dislikes
    .toLowerCase()
    .split(/[,，、\s]+/)
    .filter(Boolean);
  if (
    terms.some((t) =>
      `${recipe.zh} ${recipe.en} ${Object.keys(recipe.ingredients)
        .map((id) => `${ingredients[id].zh} ${ingredients[id].en}`)
        .join(' ')}`
        .toLowerCase()
        .includes(t),
    )
  )
    return false;
  return Object.keys(recipe.ingredients).every((id) => {
    const i = ingredients[id];
    return (
      compatibleStorage(i.storage, profile) &&
      !i.allergens.some((a) => profile.allergens.includes(a)) &&
      !(i.allergenUnknown && profile.allergens.length)
    );
  });
}
export function calorieEstimate(recipeIds: string[]) {
  return Math.round(
    Object.entries(requirements(recipeIds)).reduce(
      (n, [id, q]) => n + ingredients[id].kcalEstimate * q,
      0,
    ),
  );
}
export function requirements(recipeIds: string[]) {
  const result: Record<string, number> = {};
  for (const id of new Set(recipeIds)) {
    if (!recipeById[id]) throw new Error('餐食不存在，请重新选择。');
    for (const [key, q] of Object.entries(recipeById[id].ingredients))
      result[key] = (result[key] || 0) + q;
  }
  return result;
}
export function recommend(
  state: AppState,
  category: Category,
  slot: Slot,
  mood: Mood = 'normal',
  easy = false,
  date = today(),
): Recipe[] {
  const score = (r: Recipe) => {
    let s =
      (r.moods.includes(mood) ? 15 : 0) +
      (state.favorites.includes(r.id) ? 5 : 0) -
      r.minutes / 10;
    const needs = Object.entries(r.ingredients);
    if (needs.every(([id, q]) => available(state, id, date) >= q)) s += 40;
    for (const [id, q] of needs) {
      s += Math.min(available(state, id, date) / q, 1) * 8;
      if (
        state.batches.some(
          (b) =>
            b.ingredientId === id &&
            usable(b, state.profile, date) &&
            b.expiry &&
            b.expiry <= addDays(date, 2),
        )
      )
        s += 20;
    }
    if (slot === 'breakfast' && r.minutes <= 12) s += 4;
    if (
      state.profile.tastes.includes('spicy') &&
      (r.ingredients.luosifen || r.ingredients.kimchi)
    )
      s += 4;
    if (
      state.profile.tastes.includes('sweet') &&
      (r.ingredients.oats || r.ingredients.banana)
    )
      s += 4;
    if (state.profile.tastes.includes('light') && r.moods.includes('light'))
      s += 4;
    if (state.profile.kcal && category === 'base')
      s -= Math.abs(calorieEstimate([r.id]) - state.profile.kcal) / 100;
    // Only user-entered prices contribute; unknown prices are never invented.
    let knownCost = 0;
    for (const [id, q] of needs) {
      const spec = state.packages[id];
      if (spec?.price != null)
        knownCost +=
          (Math.max(0, q - available(state, id, date)) / spec.size) *
          spec.price;
    }
    if (state.profile.budget > 0)
      s -= knownCost / Math.max(1, state.profile.budget / 21);
    return s;
  };
  return recipes
    .filter(
      (r) =>
        r.category === category &&
        (!easy || r.easy) &&
        eligible(r, state.profile),
    )
    .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
}
export function mealName(meal: Meal) {
  return meal.kind === 'home'
    ? meal.recipeIds
        .map((id) => recipeById[id]?.zh)
        .filter(Boolean)
        .join(' + ')
    : meal.kind === 'outside'
      ? '出去吃'
      : '点外卖';
}
export function shoppingList(state: AppState, date = today()): ShoppingLine[] {
  const needed: Record<string, number> = {};
  const owned: Record<string, number> = {};
  // Allocate actual stock chronologically without mutating it. A batch used for
  // Monday's plan cannot cover Tuesday again, and expired stock is not reserved.
  const reserve = state.batches
    .map((b) => ({ ...b }))
    .sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999'));
  const slots: Slot[] = ['breakfast', 'lunch', 'dinner'];
  const plans = state.meals
    .filter(
      (m) =>
        m.date >= date &&
        m.kind === 'home' &&
        !state.logs.some((l) => l.date === m.date && l.slot === m.slot),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        slots.indexOf(a.slot) - slots.indexOf(b.slot),
    );
  for (const meal of plans)
    for (const [id, q] of Object.entries(requirements(meal.recipeIds))) {
      if (ingredients[id].persistent) {
        needed[id] = 1;
        // If the condiment won't be usable for any one planned meal, buy a replacement.
        if (available(state, id, meal.date) === 0) owned[id] = 0;
        else if (!(id in owned)) owned[id] = 1;
        continue;
      }
      needed[id] = (needed[id] || 0) + q;
      let left = q;
      for (const batch of reserve.filter(
        (b) => b.ingredientId === id && usable(b, state.profile, meal.date),
      )) {
        const take = Math.min(left, batch.remaining);
        batch.remaining -= take;
        left -= take;
        owned[id] = (owned[id] || 0) + take;
        if (!left) break;
      }
    }
  return Object.entries(needed)
    .map(([ingredientId, need]) => {
      const allocated = owned[ingredientId] || 0;
      const missing = Math.max(0, need - allocated);
      const size = state.packages[ingredientId]?.size || null;
      return {
        ingredientId,
        needed: need,
        owned: allocated,
        missing,
        size,
        packs: size ? Math.ceil(missing / size) : null,
      };
    })
    .filter((l) => l.missing > 0);
}
export function saveMeal(state: AppState, meal: Meal): AppState {
  if (meal.date < today()) throw new Error('不能新增过去的菜单。');
  if (state.logs.some((l) => l.date === meal.date && l.slot === meal.slot))
    throw new Error('这顿已经打卡；如需更换，请先撤销。');
  if (
    meal.kind === 'home' &&
    (!meal.recipeIds.length ||
      meal.recipeIds.some(
        (id) => !recipeById[id] || !eligible(recipeById[id], state.profile),
      ))
  )
    throw new Error('餐食已不符合当前厨具或忌口，请重新选择。');
  return {
    ...state,
    meals: [
      ...state.meals.filter(
        (m) => m.date !== meal.date || m.slot !== meal.slot,
      ),
      meal,
    ],
  };
}
export function purchase(
  state: AppState,
  items: Purchase[],
  id: string,
  date = today(),
): AppState {
  if (state.purchases.some((p) => p.id === id)) return state;
  if (!items.length) throw new Error('请勾选实际买到的商品。');
  for (const item of items) {
    if (
      !ingredients[item.ingredientId] ||
      !Number.isFinite(item.size) ||
      item.size <= 0 ||
      !Number.isInteger(item.packs) ||
      item.packs < 1 ||
      item.packs > 999 ||
      item.size > 1000000
    )
      throw new Error('请填写有效的每包数量及实际包数。');
    if (
      item.price != null &&
      (!Number.isFinite(item.price) || item.price < 0 || item.price > 100000)
    )
      throw new Error('价格应为非负数，未知可留空。');
    if (item.expiry && (!validDate(item.expiry) || item.expiry < date))
      throw new Error('有效期格式应为 YYYY-MM-DD，且不能已过期。');
    if (
      !compatibleStorage(ingredients[item.ingredientId].storage, state.profile)
    )
      throw new Error(
        '当前储存设施不支持该商品，请先调整设置或按餐购买无需储存的商品。',
      );
  }
  const packages = { ...state.packages };
  items.forEach((i) => {
    packages[i.ingredientId] = { size: i.size, price: i.price };
  });
  return {
    ...state,
    packages,
    purchases: [...state.purchases, { id, date, items }],
    batches: [
      ...state.batches,
      ...items.map((i, index) => ({
        id: `${id}-${index}`,
        ingredientId: i.ingredientId,
        remaining: i.size * i.packs,
        initial: i.size * i.packs,
        purchased: date,
        expiry: i.expiry,
        verified: i.verified,
        discarded: false,
      })),
    ],
  };
}
export function completeMeal(
  state: AppState,
  meal: Meal,
  date = today(),
): AppState {
  if (state.logs.some((l) => l.date === meal.date && l.slot === meal.slot))
    return state;
  if (meal.date !== date) throw new Error('只能完成今天的餐次。');
  if (
    meal.kind === 'home' &&
    (!meal.recipeIds.length ||
      meal.recipeIds.some(
        (id) => !recipeById[id] || !eligible(recipeById[id], state.profile),
      ))
  )
    throw new Error('设置已变化，请重新检查餐食的过敏原和厨具。');
  const batches = state.batches.map((b) => ({ ...b }));
  const consumption: { batchId: string; quantity: number }[] = [];
  for (const [id, qty] of Object.entries(
    meal.kind === 'home' ? requirements(meal.recipeIds) : {},
  )) {
    if (available(state, id, date) < qty)
      throw new Error(
        `${ingredients[id].zh} 库存不足或未核对安全状态，请先补购或检查库存。`,
      );
    if (ingredients[id].persistent) continue;
    let left = qty;
    const candidates = batches
      .filter((b) => b.ingredientId === id && usable(b, state.profile, date))
      .sort(
        (a, b) =>
          (a.expiry || '9999').localeCompare(b.expiry || '9999') ||
          a.purchased.localeCompare(b.purchased),
      );
    for (const b of candidates) {
      const take = Math.min(left, b.remaining);
      if (take) {
        b.remaining -= take;
        left -= take;
        consumption.push({ batchId: b.id, quantity: take });
      }
      if (!left) break;
    }
  }
  return { ...state, batches, logs: [...state.logs, { ...meal, consumption }] };
}
export function undoMeal(state: AppState, logId: string): AppState {
  const log = state.logs.find((l) => l.id === logId);
  if (!log) return state;
  const batches = state.batches.map((b) => ({ ...b }));
  for (const c of log.consumption) {
    const b = batches.find((b) => b.id === c.batchId);
    if (!b) throw new Error('原库存批次缺失，无法安全撤销。');
    b.remaining += c.quantity;
  }
  return { ...state, batches, logs: state.logs.filter((l) => l.id !== logId) };
}
export function planDays(
  state: AppState,
  days: number,
  date = today(),
): AppState {
  if (!Number.isInteger(days) || days < 3 || days > 7)
    throw new Error('请选择 3–7 天。');
  let result = {
    ...state,
    meals: state.meals.filter(
      (m) =>
        m.date < date ||
        m.date >= addDays(date, days) ||
        state.logs.some((l) => l.date === m.date && l.slot === m.slot),
    ),
  };
  for (let d = 0; d < days; d++)
    for (const slot of ['breakfast', 'lunch', 'dinner'] as Slot[]) {
      const day = addDays(date, d);
      if (result.logs.some((l) => l.date === day && l.slot === slot)) continue;
      const choices = recommend(result, 'base', slot, 'normal', false, day);
      if (!choices.length)
        throw new Error('没有符合当前厨具和忌口的主食；请调整后重试。');
      const r =
        choices[
          (d * 3 + ['breakfast', 'lunch', 'dinner'].indexOf(slot)) %
            Math.min(choices.length, 9)
        ];
      result = {
        ...result,
        meals: [
          ...result.meals,
          {
            id: uid(),
            date: day,
            slot,
            kind: 'home' as const,
            recipeIds: [r.id],
          },
        ],
      };
    }
  return result;
}
