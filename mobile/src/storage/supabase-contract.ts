import { AppState, Meal, Profile, Purchase } from '../domain/types';
/** Phase 2 boundary only; no fake login/client or server connection. */
export interface SupabaseKitchenApi {
  loadForCurrentUser(): Promise<AppState>;
  updateProfile(profile: Profile): Promise<void>;
  confirmPurchase(input: {
    idempotencyKey: string;
    items: Purchase[];
  }): Promise<void>;
  savePlan(meal: Meal): Promise<void>;
  completeMeal(input: {
    mealId: string;
    idempotencyKey: string;
  }): Promise<void>;
  undoMeal(input: { logId: string; idempotencyKey: string }): Promise<void>;
  toggleFavorite(recipeId: string): Promise<void>;
}
// user_id comes from auth.uid() on the server, never from a caller argument.
export type AuthenticatedSnapshot = {
  userId: string;
  revision: number;
  data: AppState;
};
