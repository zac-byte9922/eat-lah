import data from '../data/catalog.json';
import { z } from 'zod';
import { Ingredient, Recipe } from './types';
export const ingredients = data.ingredients as Record<string, Ingredient>;
export const recipes: Recipe[] = z
  .array(
    z.object({
      id: z.string(),
      zh: z.string(),
      en: z.string(),
      emoji: z.string(),
      category: z.enum(['base', 'dish', 'snack', 'addon']),
      minutes: z.number().nonnegative(),
      easy: z.boolean(),
      toolOptions: z.array(z.array(z.string())),
      ingredients: z.record(z.string(), z.number().positive()),
      steps: z.array(z.string()).min(1),
      moods: z.array(z.string()),
      tip: z.string(),
      addons: z.array(z.string()),
      reviewStatus: z.literal('draft'),
      licensingStatus: z.literal('original-demo'),
      nutritionStatus: z.literal('estimate'),
      sourceUrl: z.null(),
    }),
  )
  .parse(data.recipes);
export const recipeById = Object.fromEntries(recipes.map((r) => [r.id, r]));
export const tools = data.tools;
export const allergens = data.allergens;
export const slotNames = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
export const moodNames = {
  light: '清淡',
  normal: '普通',
  indulgent: '罪恶',
  lean: '减脂',
  surprise: '一键推荐',
};
