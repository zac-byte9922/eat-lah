import { z } from 'zod';
import { ingredients, recipeById } from '../domain/catalog';
const id = z.string().min(1);
const ingredientId = id.refine((x) => !!ingredients[x], 'Unknown ingredient');
const recipeId = id.refine((x) => !!recipeById[x], 'Unknown recipe');
const finite = z.number().finite().nonnegative();
const slot = z.enum(['breakfast', 'lunch', 'dinner']);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const meal = z.object({
  id,
  date,
  slot,
  kind: z.enum(['home', 'outside', 'delivery']),
  recipeIds: z.array(recipeId),
});
const purchase = z.object({
  ingredientId,
  size: finite.positive(),
  packs: finite.int().positive(),
  price: finite.nullable(),
  expiry: date.nullable(),
  verified: z.boolean(),
});
export const stateSchema = z.object({
  version: z.literal(1),
  onboarded: z.boolean(),
  profile: z.object({
    postal: z.string(),
    tools: z.array(z.string()),
    storage: z.enum(['none', 'fridge', 'freezer']),
    allergens: z.array(z.string()),
    dislikes: z.string(),
    tastes: z.array(z.string()),
    budget: finite,
    kcal: finite,
  }),
  batches: z.array(
    z.object({
      id,
      ingredientId,
      remaining: finite,
      initial: finite,
      purchased: date,
      expiry: date.nullable(),
      verified: z.boolean(),
      discarded: z.boolean(),
    }),
  ),
  meals: z.array(meal),
  logs: z.array(
    meal.extend({
      consumption: z.array(z.object({ batchId: id, quantity: finite })),
    }),
  ),
  favorites: z.array(recipeId),
  packages: z.record(
    ingredientId,
    z.object({ size: finite.positive(), price: finite.nullable() }),
  ),
  purchases: z.array(z.object({ id, date, items: z.array(purchase) })),
});
