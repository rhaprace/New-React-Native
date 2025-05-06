/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as addCustomMeal from "../addCustomMeal.js";
import type * as addFoodMacro from "../addFoodMacro.js";
import type * as addOrUpdateExercise from "../addOrUpdateExercise.js";
import type * as calorieGoalTracking from "../calorieGoalTracking.js";
import type * as categorizeFoods from "../categorizeFoods.js";
import type * as chat from "../chat.js";
import type * as exercise from "../exercise.js";
import type * as getFoodMacros from "../getFoodMacros.js";
import type * as http from "../http.js";
import type * as initChatReset from "../initChatReset.js";
import type * as internal_chatReset from "../internal/chatReset.js";
import type * as meal from "../meal.js";
import type * as recentWorkouts from "../recentWorkouts.js";
import type * as seedExerciseData from "../seedExerciseData.js";
import type * as seedRecentWorkouts from "../seedRecentWorkouts.js";
import type * as subscription from "../subscription.js";
import type * as updateFoodMacros from "../updateFoodMacros.js";
import type * as users from "../users.js";
import type * as weightPrediction from "../weightPrediction.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  addCustomMeal: typeof addCustomMeal;
  addFoodMacro: typeof addFoodMacro;
  addOrUpdateExercise: typeof addOrUpdateExercise;
  calorieGoalTracking: typeof calorieGoalTracking;
  categorizeFoods: typeof categorizeFoods;
  chat: typeof chat;
  exercise: typeof exercise;
  getFoodMacros: typeof getFoodMacros;
  http: typeof http;
  initChatReset: typeof initChatReset;
  "internal/chatReset": typeof internal_chatReset;
  meal: typeof meal;
  recentWorkouts: typeof recentWorkouts;
  seedExerciseData: typeof seedExerciseData;
  seedRecentWorkouts: typeof seedRecentWorkouts;
  subscription: typeof subscription;
  updateFoodMacros: typeof updateFoodMacros;
  users: typeof users;
  weightPrediction: typeof weightPrediction;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
