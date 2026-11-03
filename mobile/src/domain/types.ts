export type Slot = 'breakfast' | 'lunch' | 'dinner';
export type Mood = 'light' | 'normal' | 'indulgent' | 'lean' | 'surprise';
export type Storage = 'none' | 'fridge' | 'freezer';
export type Category = 'base' | 'dish' | 'snack' | 'addon';
export interface Profile {
  postal: string;
  tools: string[];
  storage: Storage;
  allergens: string[];
  dislikes: string;
  tastes: string[];
  budget: number;
  kcal: number;
}
export interface Ingredient {
  id: string;
  zh: string;
  en: string;
  unit: string;
  storage: string;
  allergens: string[];
  allergenUnknown: boolean;
  persistent: boolean;
  kcalEstimate: number;
}
export interface Recipe {
  id: string;
  zh: string;
  en: string;
  emoji: string;
  category: Category;
  minutes: number;
  easy: boolean;
  toolOptions: string[][];
  ingredients: Record<string, number>;
  steps: string[];
  moods: string[];
  tip: string;
  addons: string[];
  reviewStatus: 'draft';
  licensingStatus: 'original-demo';
  nutritionStatus: 'estimate';
  sourceUrl: null;
}
export interface Batch {
  id: string;
  ingredientId: string;
  remaining: number;
  initial: number;
  purchased: string;
  expiry: string | null;
  verified: boolean;
  discarded: boolean;
}
export interface Meal {
  id: string;
  date: string;
  slot: Slot;
  kind: 'home' | 'outside' | 'delivery';
  recipeIds: string[];
}
export interface Consumption {
  batchId: string;
  quantity: number;
}
export interface MealLog extends Meal {
  consumption: Consumption[];
}
export interface PackageSpec {
  size: number;
  price: number | null;
}
export interface Purchase {
  ingredientId: string;
  size: number;
  packs: number;
  price: number | null;
  expiry: string | null;
  verified: boolean;
}
export interface PurchaseRecord {
  id: string;
  date: string;
  items: Purchase[];
}
export interface AppState {
  version: 1;
  profile: Profile;
  onboarded: boolean;
  batches: Batch[];
  meals: Meal[];
  logs: MealLog[];
  favorites: string[];
  packages: Record<string, PackageSpec>;
  purchases: PurchaseRecord[];
}
export interface ShoppingLine {
  ingredientId: string;
  needed: number;
  owned: number;
  missing: number;
  size: number | null;
  packs: number | null;
}
