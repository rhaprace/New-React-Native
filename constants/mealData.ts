export interface MealItem {
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  items: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeeklyMeal {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

// Import the day formatting utility
import { getAllDays } from '@/utils/dayFormatting';

// Create empty meal plans
export const createEmptyWeeklyMeals = (): WeeklyMeal[] => {
  // Use the standardized day formatting from the utility
  const days = getAllDays();
  return days.map(day => ({
    day,
    breakfast: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
    lunch: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
    dinner: { items: [], calories: 0, protein: 0, carbs: 0, fat: 0 }
  }));
};

export const weeklyMealsWeightLoss: WeeklyMeal[] = createEmptyWeeklyMeals();

// Original meal data for reference (now used for recommendations)
export const originalWeeklyMealsWeightLoss: WeeklyMeal[] = [
  {
    day: "Monday",
    breakfast: {
      items: [
        {
          meal: "Greek yogurt with berries and a handful of almonds",
          calories: 300,
          protein: 18,
          carbs: 28,
          fat: 15
        }
      ],
      calories: 300,
      protein: 18,
      carbs: 28,
      fat: 15
    },
    lunch: {
      items: [
        {
          meal: "Grilled chicken salad with mixed greens, avocado, and olive oil dressing",
          calories: 450,
          protein: 35,
          carbs: 15,
          fat: 30
        }
      ],
      calories: 450,
      protein: 35,
      carbs: 15,
      fat: 30
    },
    dinner: {
      items: [
        {
          meal: "Baked salmon with roasted vegetables (broccoli, zucchini, and carrots)",
          calories: 500,
          protein: 40,
          carbs: 25,
          fat: 25
        }
      ],
      calories: 500,
      protein: 40,
      carbs: 25,
      fat: 25
    }
  },
  {
    day: "Tuesday",
    breakfast: {
      items: [
        {
          meal: "Scrambled eggs with spinach and whole wheat toast",
          calories: 350,
          protein: 20,
          carbs: 30,
          fat: 20
        }
      ],
      calories: 350,
      protein: 20,
      carbs: 30,
      fat: 20
    },
    lunch: {
      items: [
        {
          meal: "Turkey and avocado lettuce wraps with a side of cucumber slices",
          calories: 400,
          protein: 30,
          carbs: 12,
          fat: 28
        }
      ],
      calories: 400,
      protein: 30,
      carbs: 12,
      fat: 28
    },
    dinner: {
      items: [
        {
          meal: "Grilled shrimp with quinoa and steamed asparagus",
          calories: 450,
          protein: 40,
          carbs: 30,
          fat: 18
        }
      ],
      calories: 450,
      protein: 40,
      carbs: 30,
      fat: 18
    }
  },
  {
    day: "Wednesday",
    breakfast: {
      meal: "Smoothie with protein powder, spinach, almond milk, and chia seeds",
      calories: 300,
      protein: 25,
      carbs: 20,
      fat: 12
    },
    lunch: {
      meal: "Tuna salad with mixed greens, olive oil, and balsamic vinegar",
      calories: 400,
      protein: 35,
      carbs: 10,
      fat: 25
    },
    dinner: {
      meal: "Chicken stir-fry with bell peppers, broccoli, and brown rice",
      calories: 500,
      protein: 45,
      carbs: 40,
      fat: 18
    }
  },
  {
    day: "Thursday",
    breakfast: {
      meal: "Oats with almond butter, flax seeds, and a few slices of banana",
      calories: 350,
      protein: 12,
      carbs: 45,
      fat: 14
    },
    lunch: {
      meal: "Grilled chicken breast with roasted sweet potato and steamed broccoli",
      calories: 450,
      protein: 40,
      carbs: 35,
      fat: 12
    },
    dinner: {
      meal: "Zucchini noodles with marinara sauce and turkey meatballs",
      calories: 400,
      protein: 35,
      carbs: 25,
      fat: 20
    }
  },
  {
    day: "Friday",
    breakfast: {
      meal: "Avocado toast on whole-grain bread with a boiled egg",
      calories: 350,
      protein: 12,
      carbs: 30,
      fat: 22
    },
    lunch: {
      meal: "Grilled fish tacos with cabbage slaw and salsa on corn tortillas",
      calories: 450,
      protein: 30,
      carbs: 40,
      fat: 15
    },
    dinner: {
      meal: "Baked chicken thighs with a side of green beans and quinoa",
      calories: 500,
      protein: 45,
      carbs: 35,
      fat: 22
    }
  },
  {
    day: "Saturday",
    breakfast: {
      meal: "Chia pudding with coconut milk and fresh strawberries",
      calories: 300,
      protein: 10,
      carbs: 20,
      fat: 18
    },
    lunch: {
      meal: "Cobb salad with grilled chicken, avocado, egg, and light dressing",
      calories: 450,
      protein: 35,
      carbs: 15,
      fat: 30
    },
    dinner: {
      meal: "Grilled turkey burger with a side of roasted Brussels sprouts",
      calories: 500,
      protein: 40,
      carbs: 25,
      fat: 30
    }
  },
  {
    day: "Sunday",
    breakfast: {
      meal: "Protein pancakes topped with fresh berries and a drizzle of honey",
      calories: 400,
      protein: 30,
      carbs: 45,
      fat: 12
    },
    lunch: {
      meal: "Roasted chicken breast with a mixed veggie salad (tomatoes, cucumber, lettuce)",
      calories: 450,
      protein: 40,
      carbs: 20,
      fat: 22
    },
    dinner: {
      meal: "Grilled shrimp skewers with a side of cauliflower rice and sautéed spinach",
      calories: 500,
      protein: 45,
      carbs: 25,
      fat: 22
    }
  }
];

export const weeklyMealsForGainWeight: WeeklyMeal[] = createEmptyWeeklyMeals();

// Original meal data for reference (now used for recommendations)
export const originalWeeklyMealsForGainWeight: WeeklyMeal[] = [
  {
    day: "Monday",
    breakfast: {
      meal: "Greek yogurt with granola, banana, and peanut butter",
      calories: 600,
      protein: 30,
      carbs: 75,
      fat: 25
    },
    lunch: {
      meal: "Grilled chicken breast with quinoa, avocado, and roasted sweet potatoes",
      calories: 750,
      protein: 45,
      carbs: 60,
      fat: 30
    },
    dinner: {
      meal: "Salmon with mashed potatoes, steamed broccoli, and olive oil",
      calories: 800,
      protein: 50,
      carbs: 60,
      fat: 40
    }
  },
  {
    day: "Tuesday",
    breakfast: {
      meal: "Oats with almond butter, chia seeds, and whole milk",
      calories: 650,
      protein: 18,
      carbs: 80,
      fat: 28
    },
    lunch: {
      meal: "Turkey and cheese sandwich with whole-grain bread, and a side of avocado",
      calories: 700,
      protein: 35,
      carbs: 55,
      fat: 35
    },
    dinner: {
      meal: "Grilled steak with brown rice, green beans, and a side of olive oil",
      calories: 900,
      protein: 60,
      carbs: 75,
      fat: 45
    }
  },
  {
    day: "Wednesday",
    breakfast: {
      meal: "Protein smoothie with banana, spinach, almond milk, and peanut butter",
      calories: 700,
      protein: 35,
      carbs: 85,
      fat: 25
    },
    lunch: {
      meal: "Chicken fajitas with rice, beans, avocado, and tortilla wraps",
      calories: 800,
      protein: 40,
      carbs: 85,
      fat: 30
    },
    dinner: {
      meal: "Pasta with marinara sauce, ground beef, and grated cheese",
      calories: 850,
      protein: 45,
      carbs: 85,
      fat: 30
    }
  },
  {
    day: "Thursday",
    breakfast: {
      meal: "Scrambled eggs with cheese, whole-grain toast, and avocado",
      calories: 650,
      protein: 25,
      carbs: 45,
      fat: 35
    },
    lunch: {
      meal: "Grilled chicken with couscous, roasted vegetables, and hummus",
      calories: 750,
      protein: 50,
      carbs: 75,
      fat: 30
    },
    dinner: {
      meal: "Salmon with brown rice, steamed broccoli, and butter",
      calories: 850,
      protein: 55,
      carbs: 60,
      fat: 40
    }
  },
  {
    day: "Friday",
    breakfast: {
      meal: "Chia pudding with coconut milk, almonds, and dried fruit",
      calories: 600,
      protein: 18,
      carbs: 70,
      fat: 30
    },
    lunch: {
      meal: "Chicken breast with sweet potatoes, avocado, and quinoa",
      calories: 800,
      protein: 50,
      carbs: 65,
      fat: 35
    },
    dinner: {
      meal: "Baked cod with mashed potatoes, sautéed spinach, and olive oil",
      calories: 850,
      protein: 45,
      carbs: 70,
      fat: 40
    }
  },
  {
    day: "Saturday",
    breakfast: {
      meal: "Protein pancakes with maple syrup and a side of scrambled eggs",
      calories: 700,
      protein: 30,
      carbs: 85,
      fat: 25
    },
    lunch: {
      meal: "Beef burger with cheese, whole-grain bun, fries, and coleslaw",
      calories: 950,
      protein: 50,
      carbs: 80,
      fat: 50
    },
    dinner: {
      meal: "Spaghetti with meatballs, marinara sauce, and garlic bread",
      calories: 900,
      protein: 50,
      carbs: 95,
      fat: 35
    }
  },
  {
    day: "Sunday",
    breakfast: {
      meal: "Greek yogurt with honey, mixed nuts, and oats",
      calories: 650,
      protein: 30,
      carbs: 75,
      fat: 25
    },
    lunch: {
      meal: "Grilled chicken with brown rice, mixed greens, and balsamic dressing",
      calories: 700,
      protein: 50,
      carbs: 60,
      fat: 25
    },
    dinner: {
      meal: "Roast beef with mashed potatoes, sautéed spinach, and gravy",
      calories: 900,
      protein: 55,
      carbs: 70,
      fat: 40
    }
  }
];

export const weeklyMealsForMaintainWeight: WeeklyMeal[] = createEmptyWeeklyMeals();

// Original meal data for reference (now used for recommendations)
export const originalWeeklyMealsForMaintainWeight: WeeklyMeal[] = [
  {
    day: "Monday",
    breakfast: {
      meal: "Greek yogurt with mixed berries and a sprinkle of chia seeds",
      calories: 400,
      protein: 20,
      carbs: 45,
      fat: 15
    },
    lunch: {
      meal: "Grilled chicken breast with mixed greens, quinoa, and olive oil dressing",
      calories: 550,
      protein: 40,
      carbs: 45,
      fat: 20
    },
    dinner: {
      meal: "Baked salmon with roasted vegetables (broccoli, zucchini, and carrots)",
      calories: 600,
      protein: 45,
      carbs: 40,
      fat: 30
    }
  },
  {
    day: "Tuesday",
    breakfast: {
      meal: "Oats with almond butter, flaxseeds, and banana",
      calories: 450,
      protein: 15,
      carbs: 60,
      fat: 18
    },
    lunch: {
      meal: "Turkey and avocado sandwich with whole-grain bread and a side of cucumber slices",
      calories: 550,
      protein: 30,
      carbs: 50,
      fat: 25
    },
    dinner: {
      meal: "Grilled shrimp with quinoa and steamed asparagus",
      calories: 600,
      protein: 45,
      carbs: 45,
      fat: 20
    }
  },
  {
    day: "Wednesday",
    breakfast: {
      meal: "Scrambled eggs with spinach and whole-grain toast",
      calories: 400,
      protein: 20,
      carbs: 30,
      fat: 22
    },
    lunch: {
      meal: "Tuna salad with mixed greens, olive oil, and balsamic vinegar",
      calories: 500,
      protein: 35,
      carbs: 15,
      fat: 35
    },
    dinner: {
      meal: "Chicken stir-fry with bell peppers, broccoli, and brown rice",
      calories: 650,
      protein: 45,
      carbs: 55,
      fat: 22
    }
  },
  {
    day: "Thursday",
    breakfast: {
      meal: "Chia pudding with coconut milk and fresh strawberries",
      calories: 400,
      protein: 15,
      carbs: 40,
      fat: 18
    },
    lunch: {
      meal: "Grilled chicken with roasted sweet potatoes and steamed broccoli",
      calories: 550,
      protein: 40,
      carbs: 45,
      fat: 18
    },
    dinner: {
      meal: "Zucchini noodles with marinara sauce and turkey meatballs",
      calories: 600,
      protein: 40,
      carbs: 35,
      fat: 25
    }
  },
  {
    day: "Friday",
    breakfast: {
      meal: "Smoothie with protein powder, spinach, almond milk, and chia seeds",
      calories: 450,
      protein: 30,
      carbs: 40,
      fat: 15
    },
    lunch: {
      meal: "Grilled fish tacos with cabbage slaw and salsa on corn tortillas",
      calories: 550,
      protein: 35,
      carbs: 50,
      fat: 25
    },
    dinner: {
      meal: "Baked chicken thighs with green beans and quinoa",
      calories: 600,
      protein: 45,
      carbs: 45,
      fat: 25
    }
  },
  {
    day: "Saturday",
    breakfast: {
      meal: "Avocado toast on whole-grain bread with a boiled egg",
      calories: 400,
      protein: 15,
      carbs: 30,
      fat: 25
    },
    lunch: {
      meal: "Cobb salad with grilled chicken, avocado, egg, and light dressing",
      calories: 550,
      protein: 40,
      carbs: 20,
      fat: 35
    },
    dinner: {
      meal: "Grilled turkey burger with a side of roasted Brussels sprouts",
      calories: 600,
      protein: 45,
      carbs: 35,
      fat: 30
    }
  },
  {
    day: "Sunday",
    breakfast: {
      meal: "Protein pancakes topped with fresh berries and a drizzle of honey",
      calories: 500,
      protein: 30,
      carbs: 55,
      fat: 18
    },
    lunch: {
      meal: "Roasted chicken breast with a mixed veggie salad (tomatoes, cucumber, lettuce)",
      calories: 550,
      protein: 45,
      carbs: 25,
      fat: 25
    },
    dinner: {
      meal: "Grilled shrimp skewers with cauliflower rice and sautéed spinach",
      calories: 600,
      protein: 45,
      carbs: 35,
      fat: 25
    }
  }
];