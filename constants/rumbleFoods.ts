import { COLORS } from "./theme";

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case "protein":
      return `${COLORS.primary}30`;
    case "carb":
      return `${COLORS.secondary}30`;
    case "fat":
      return `${COLORS.warning}30`;
    case "vegetable":
      return `${COLORS.success}30`;
    case "fruit":
      return `${COLORS.success}50`;
    case "dairy":
      return `${COLORS.primaryLight}30`;
    case "snack":
      return `${COLORS.secondaryLight}30`;
    default:
      return COLORS.surfaceAlt;
  }
};

export type RumbleFood = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  category: "protein" | "carb" | "fat" | "vegetable" | "fruit" | "dairy" | "snack";
  image?: string;
  tags: string[];
};

export const rumbleFoods: RumbleFood[] = [
  // Protein sources
  {
    id: "p1",
    name: "Grilled Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    description: "Lean protein source, perfect for muscle building",
    category: "protein",
    tags: ["high-protein", "low-carb", "meal-prep"],
  },
  {
    id: "p2",
    name: "Salmon Fillet",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    description: "Rich in omega-3 fatty acids and high-quality protein",
    category: "protein",
    tags: ["high-protein", "healthy-fats", "omega-3"],
  },
  {
    id: "p3",
    name: "Lean Ground Turkey",
    calories: 170,
    protein: 22,
    carbs: 0,
    fat: 8,
    description: "Versatile lean protein for various recipes",
    category: "protein",
    tags: ["high-protein", "low-fat", "versatile"],
  },
  {
    id: "p4",
    name: "Tuna Steak",
    calories: 184,
    protein: 40,
    carbs: 0,
    fat: 1,
    description: "Extremely high in protein with minimal fat",
    category: "protein",
    tags: ["high-protein", "low-fat", "omega-3"],
  },
  {
    id: "p5",
    name: "Egg Whites",
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fat: 0.2,
    description: "Pure protein source with minimal calories",
    category: "protein",
    tags: ["high-protein", "low-calorie", "breakfast"],
  },
  {
    id: "p6",
    name: "Greek Yogurt",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.4,
    description: "Creamy protein source with probiotics",
    category: "protein",
    tags: ["high-protein", "probiotics", "snack"],
  },
  {
    id: "p7",
    name: "Tofu",
    calories: 144,
    protein: 17,
    carbs: 3,
    fat: 8,
    description: "Plant-based protein source rich in minerals",
    category: "protein",
    tags: ["plant-based", "vegetarian", "versatile"],
  },
  {
    id: "p8",
    name: "Whey Protein Isolate",
    calories: 113,
    protein: 27,
    carbs: 1,
    fat: 0.5,
    description: "Fast-absorbing protein supplement",
    category: "protein",
    tags: ["supplement", "post-workout", "high-protein"],
  },
  {
    id: "p9",
    name: "Lean Beef Steak",
    calories: 217,
    protein: 26,
    carbs: 0,
    fat: 12,
    description: "Rich in iron and high-quality protein",
    category: "protein",
    tags: ["high-protein", "iron-rich", "dinner"],
  },
  {
    id: "p10",
    name: "Cottage Cheese",
    calories: 163,
    protein: 28,
    carbs: 6,
    fat: 2.3,
    description: "Slow-digesting protein, great before bed",
    category: "protein",
    tags: ["high-protein", "slow-digesting", "snack"],
  },

  // Carbohydrate sources
  {
    id: "c1",
    name: "Brown Rice",
    calories: 112,
    protein: 2.6,
    carbs: 24,
    fat: 0.9,
    description: "Whole grain carb source rich in fiber",
    category: "carb",
    tags: ["complex-carbs", "whole-grain", "fiber"],
  },
  {
    id: "c2",
    name: "Sweet Potato",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    description: "Nutrient-dense carb source rich in vitamins",
    category: "carb",
    tags: ["complex-carbs", "vitamin-a", "fiber"],
  },
  {
    id: "c3",
    name: "Quinoa",
    calories: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    description: "Complete protein and complex carb source",
    category: "carb",
    tags: ["complex-carbs", "complete-protein", "gluten-free"],
  },
  {
    id: "c4",
    name: "Oatmeal",
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 2.5,
    description: "Slow-digesting carbs with beta-glucans",
    category: "carb",
    tags: ["complex-carbs", "breakfast", "fiber"],
  },
  {
    id: "c5",
    name: "Whole Wheat Pasta",
    calories: 174,
    protein: 7.5,
    carbs: 37,
    fat: 0.8,
    description: "Higher protein pasta alternative",
    category: "carb",
    tags: ["complex-carbs", "whole-grain", "dinner"],
  },
  {
    id: "c6",
    name: "Ezekiel Bread",
    calories: 80,
    protein: 4,
    carbs: 15,
    fat: 0.5,
    description: "Sprouted grain bread with complete protein",
    category: "carb",
    tags: ["complex-carbs", "sprouted-grain", "breakfast"],
  },
  {
    id: "c7",
    name: "Black Beans",
    calories: 132,
    protein: 8.9,
    carbs: 24,
    fat: 0.6,
    description: "Fiber-rich carb source with plant protein",
    category: "carb",
    tags: ["complex-carbs", "plant-protein", "fiber"],
  },
  {
    id: "c8",
    name: "Banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    description: "Quick energy source rich in potassium",
    category: "carb",
    tags: ["simple-carbs", "pre-workout", "potassium"],
  },
  {
    id: "c9",
    name: "Jasmine Rice",
    calories: 160,
    protein: 3,
    carbs: 36,
    fat: 0.3,
    description: "Fast-digesting carb source for quick energy",
    category: "carb",
    tags: ["simple-carbs", "post-workout", "quick-energy"],
  },
  {
    id: "c10",
    name: "Chickpeas",
    calories: 164,
    protein: 8.9,
    carbs: 27,
    fat: 2.6,
    description: "Versatile carb source with plant protein",
    category: "carb",
    tags: ["complex-carbs", "plant-protein", "fiber"],
  },

  // Fat sources
  {
    id: "f1",
    name: "Avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    description: "Nutrient-dense source of healthy monounsaturated fats",
    category: "fat",
    tags: ["healthy-fats", "monounsaturated", "fiber"],
  },
  {
    id: "f2",
    name: "Almonds",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    description: "Crunchy nuts rich in vitamin E and healthy fats",
    category: "fat",
    tags: ["healthy-fats", "vitamin-e", "snack"],
  },
  {
    id: "f3",
    name: "Olive Oil",
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    description: "Heart-healthy oil rich in antioxidants",
    category: "fat",
    tags: ["healthy-fats", "monounsaturated", "cooking"],
  },
  {
    id: "f4",
    name: "Chia Seeds",
    calories: 58,
    protein: 2,
    carbs: 5,
    fat: 3.7,
    description: "Tiny seeds packed with omega-3 fatty acids",
    category: "fat",
    tags: ["healthy-fats", "omega-3", "fiber"],
  },
  {
    id: "f5",
    name: "Walnuts",
    calories: 185,
    protein: 4.3,
    carbs: 3.9,
    fat: 18.5,
    description: "Brain-healthy nuts with omega-3 fatty acids",
    category: "fat",
    tags: ["healthy-fats", "omega-3", "snack"],
  },
  {
    id: "f6",
    name: "Flaxseed",
    calories: 55,
    protein: 1.9,
    carbs: 3,
    fat: 4.3,
    description: "Fiber-rich seeds with omega-3 fatty acids",
    category: "fat",
    tags: ["healthy-fats", "omega-3", "fiber"],
  },
  {
    id: "f7",
    name: "Coconut Oil",
    calories: 121,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    description: "MCT-rich oil for quick energy",
    category: "fat",
    tags: ["mct", "saturated-fat", "cooking"],
  },
  {
    id: "f8",
    name: "Egg Yolks",
    calories: 55,
    protein: 2.7,
    carbs: 0.6,
    fat: 4.5,
    description: "Nutrient-dense source of healthy fats and cholesterol",
    category: "fat",
    tags: ["healthy-fats", "cholesterol", "breakfast"],
  },
  {
    id: "f9",
    name: "Peanut Butter",
    calories: 94,
    protein: 4,
    carbs: 3.1,
    fat: 8,
    description: "Creamy spread rich in monounsaturated fats",
    category: "fat",
    tags: ["healthy-fats", "plant-protein", "snack"],
  },
  {
    id: "f10",
    name: "Macadamia Nuts",
    calories: 204,
    protein: 2.2,
    carbs: 3.9,
    fat: 21.5,
    description: "Highest fat content nuts with monounsaturated fats",
    category: "fat",
    tags: ["healthy-fats", "monounsaturated", "snack"],
  },

  // Vegetables
  {
    id: "v1",
    name: "Broccoli",
    calories: 55,
    protein: 3.7,
    carbs: 11,
    fat: 0.6,
    description: "Cruciferous vegetable rich in vitamins and fiber",
    category: "vegetable",
    tags: ["fiber", "vitamin-c", "low-calorie"],
  },
  {
    id: "v2",
    name: "Spinach",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    description: "Leafy green rich in iron and antioxidants",
    category: "vegetable",
    tags: ["iron", "vitamin-a", "low-calorie"],
  },
  {
    id: "v3",
    name: "Kale",
    calories: 33,
    protein: 2.2,
    carbs: 6.7,
    fat: 0.5,
    description: "Nutrient-dense leafy green with antioxidants",
    category: "vegetable",
    tags: ["vitamin-k", "antioxidants", "low-calorie"],
  },
  {
    id: "v4",
    name: "Bell Peppers",
    calories: 31,
    protein: 1,
    carbs: 6,
    fat: 0.3,
    description: "Crunchy vegetable rich in vitamin C",
    category: "vegetable",
    tags: ["vitamin-c", "antioxidants", "low-calorie"],
  },
  {
    id: "v5",
    name: "Cauliflower",
    calories: 25,
    protein: 1.9,
    carbs: 5,
    fat: 0.3,
    description: "Versatile cruciferous vegetable",
    category: "vegetable",
    tags: ["fiber", "vitamin-c", "low-calorie"],
  },
  {
    id: "v6",
    name: "Asparagus",
    calories: 20,
    protein: 2.2,
    carbs: 3.9,
    fat: 0.2,
    description: "Nutrient-dense vegetable with detoxifying properties",
    category: "vegetable",
    tags: ["fiber", "vitamin-k", "low-calorie"],
  },
  {
    id: "v7",
    name: "Brussels Sprouts",
    calories: 43,
    protein: 3,
    carbs: 9,
    fat: 0.3,
    description: "Mini cabbage with cancer-fighting compounds",
    category: "vegetable",
    tags: ["fiber", "vitamin-c", "low-calorie"],
  },
  {
    id: "v8",
    name: "Zucchini",
    calories: 17,
    protein: 1.2,
    carbs: 3.1,
    fat: 0.3,
    description: "Low-calorie vegetable perfect for pasta alternatives",
    category: "vegetable",
    tags: ["low-calorie", "vitamin-a", "versatile"],
  },
  {
    id: "v9",
    name: "Mushrooms",
    calories: 22,
    protein: 3.1,
    carbs: 3.3,
    fat: 0.3,
    description: "Umami-rich fungi with vitamin D",
    category: "vegetable",
    tags: ["vitamin-d", "low-calorie", "umami"],
  },
  {
    id: "v10",
    name: "Carrots",
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    description: "Sweet vegetable rich in beta-carotene",
    category: "vegetable",
    tags: ["vitamin-a", "beta-carotene", "low-calorie"],
  },

  // Fruits
  {
    id: "fr1",
    name: "Blueberries",
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    description: "Antioxidant-rich berries for brain health",
    category: "fruit",
    tags: ["antioxidants", "low-glycemic", "fiber"],
  },
  {
    id: "fr2",
    name: "Strawberries",
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    description: "Low-calorie berries rich in vitamin C",
    category: "fruit",
    tags: ["vitamin-c", "low-calorie", "antioxidants"],
  },
  {
    id: "fr3",
    name: "Apple",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    description: "Fiber-rich fruit with pectin for gut health",
    category: "fruit",
    tags: ["fiber", "pectin", "portable"],
  },
  {
    id: "fr4",
    name: "Orange",
    calories: 47,
    protein: 0.9,
    carbs: 11.8,
    fat: 0.1,
    description: "Citrus fruit packed with vitamin C",
    category: "fruit",
    tags: ["vitamin-c", "immune-support", "hydrating"],
  },
  {
    id: "fr5",
    name: "Kiwi",
    calories: 61,
    protein: 1.1,
    carbs: 14.7,
    fat: 0.5,
    description: "Vitamin C-rich fruit with digestive enzymes",
    category: "fruit",
    tags: ["vitamin-c", "enzymes", "fiber"],
  },
  {
    id: "fr6",
    name: "Pineapple",
    calories: 50,
    protein: 0.5,
    carbs: 13.1,
    fat: 0.1,
    description: "Tropical fruit with bromelain enzyme",
    category: "fruit",
    tags: ["enzymes", "vitamin-c", "tropical"],
  },
  {
    id: "fr7",
    name: "Watermelon",
    calories: 30,
    protein: 0.6,
    carbs: 7.6,
    fat: 0.2,
    description: "Hydrating fruit rich in lycopene",
    category: "fruit",
    tags: ["hydrating", "lycopene", "low-calorie"],
  },
  {
    id: "fr8",
    name: "Grapes",
    calories: 69,
    protein: 0.7,
    carbs: 18.1,
    fat: 0.2,
    description: "Sweet fruit with resveratrol antioxidant",
    category: "fruit",
    tags: ["antioxidants", "resveratrol", "portable"],
  },
  {
    id: "fr9",
    name: "Mango",
    calories: 60,
    protein: 0.8,
    carbs: 15,
    fat: 0.4,
    description: "Tropical fruit rich in vitamin A",
    category: "fruit",
    tags: ["vitamin-a", "tropical", "fiber"],
  },
  {
    id: "fr10",
    name: "Pomegranate",
    calories: 83,
    protein: 1.7,
    carbs: 18.7,
    fat: 1.2,
    description: "Antioxidant-rich fruit with unique compounds",
    category: "fruit",
    tags: ["antioxidants", "polyphenols", "fiber"],
  },

  // Dairy
  {
    id: "d1",
    name: "Whole Milk",
    calories: 149,
    protein: 7.7,
    carbs: 11.7,
    fat: 8,
    description: "Complete protein source with calcium",
    category: "dairy",
    tags: ["calcium", "vitamin-d", "complete-protein"],
  },
  {
    id: "d2",
    name: "Cheddar Cheese",
    calories: 113,
    protein: 7,
    carbs: 0.4,
    fat: 9.3,
    description: "Aged cheese rich in calcium and protein",
    category: "dairy",
    tags: ["calcium", "protein", "vitamin-k2"],
  },
  {
    id: "d3",
    name: "Mozzarella Cheese",
    calories: 85,
    protein: 6.3,
    carbs: 0.6,
    fat: 6.3,
    description: "Lower-fat cheese option",
    category: "dairy",
    tags: ["calcium", "protein", "lower-fat"],
  },
  {
    id: "d4",
    name: "Feta Cheese",
    calories: 74,
    protein: 4,
    carbs: 1.2,
    fat: 6,
    description: "Tangy cheese with lower calories",
    category: "dairy",
    tags: ["calcium", "protein", "lower-calorie"],
  },
  {
    id: "d5",
    name: "Kefir",
    calories: 110,
    protein: 11,
    carbs: 12,
    fat: 2,
    description: "Probiotic-rich fermented dairy drink",
    category: "dairy",
    tags: ["probiotics", "calcium", "protein"],
  },
  {
    id: "d6",
    name: "Skyr",
    calories: 110,
    protein: 19,
    carbs: 5,
    fat: 0.4,
    description: "Icelandic yogurt with extremely high protein",
    category: "dairy",
    tags: ["high-protein", "probiotics", "low-fat"],
  },
  {
    id: "d7",
    name: "Ricotta Cheese",
    calories: 174,
    protein: 14,
    carbs: 3,
    fat: 12,
    description: "Soft cheese rich in whey protein",
    category: "dairy",
    tags: ["calcium", "whey-protein", "versatile"],
  },
  {
    id: "d8",
    name: "Goat Cheese",
    calories: 103,
    protein: 6,
    carbs: 0.9,
    fat: 8.5,
    description: "Tangy cheese that's easier to digest",
    category: "dairy",
    tags: ["calcium", "protein", "digestible"],
  },
  {
    id: "d9",
    name: "Butter",
    calories: 102,
    protein: 0.1,
    carbs: 0,
    fat: 11.5,
    description: "Dairy fat rich in vitamin A and K2",
    category: "dairy",
    tags: ["vitamin-k2", "saturated-fat", "cooking"],
  },
  {
    id: "d10",
    name: "Whipped Cream",
    calories: 51,
    protein: 0.4,
    carbs: 0.4,
    fat: 5.4,
    description: "Aerated dairy fat for desserts",
    category: "dairy",
    tags: ["treat", "dessert", "fat"],
  },

  // Snacks
  {
    id: "s1",
    name: "Protein Bar",
    calories: 210,
    protein: 20,
    carbs: 20,
    fat: 7,
    description: "Convenient protein source for on-the-go",
    category: "snack",
    tags: ["high-protein", "convenient", "portable"],
  },
  {
    id: "s2",
    name: "Trail Mix",
    calories: 173,
    protein: 5,
    carbs: 12,
    fat: 12,
    description: "Energy-dense mix of nuts, seeds, and dried fruit",
    category: "snack",
    tags: ["energy-dense", "healthy-fats", "portable"],
  },
  {
    id: "s3",
    name: "Beef Jerky",
    calories: 116,
    protein: 9.4,
    carbs: 3.1,
    fat: 7.3,
    description: "Portable protein source with long shelf life",
    category: "snack",
    tags: ["high-protein", "portable", "shelf-stable"],
  },
  {
    id: "s4",
    name: "Rice Cakes",
    calories: 35,
    protein: 0.7,
    carbs: 7.3,
    fat: 0.3,
    description: "Low-calorie crunchy snack base",
    category: "snack",
    tags: ["low-calorie", "gluten-free", "versatile"],
  },
  {
    id: "s5",
    name: "Protein Shake",
    calories: 170,
    protein: 25,
    carbs: 9,
    fat: 3,
    description: "Convenient liquid protein source",
    category: "snack",
    tags: ["high-protein", "convenient", "post-workout"],
  },
  {
    id: "s6",
    name: "Hummus",
    calories: 166,
    protein: 7.9,
    carbs: 14.3,
    fat: 9.6,
    description: "Chickpea dip rich in protein and healthy fats",
    category: "snack",
    tags: ["plant-protein", "healthy-fats", "fiber"],
  },
  {
    id: "s7",
    name: "Dark Chocolate",
    calories: 170,
    protein: 2.2,
    carbs: 13,
    fat: 12,
    description: "Antioxidant-rich treat with magnesium",
    category: "snack",
    tags: ["antioxidants", "magnesium", "treat"],
  },
  {
    id: "s8",
    name: "Protein Chips",
    calories: 130,
    protein: 15,
    carbs: 9,
    fat: 4.5,
    description: "Crunchy protein-enriched snack",
    category: "snack",
    tags: ["high-protein", "crunchy", "portable"],
  },
  {
    id: "s9",
    name: "Edamame",
    calories: 122,
    protein: 11,
    carbs: 10,
    fat: 5,
    description: "Young soybeans rich in plant protein",
    category: "snack",
    tags: ["plant-protein", "fiber", "portable"],
  },
  {
    id: "s10",
    name: "Protein Yogurt",
    calories: 170,
    protein: 25,
    carbs: 10,
    fat: 2,
    description: "Protein-enriched yogurt for muscle recovery",
    category: "snack",
    tags: ["high-protein", "probiotics", "calcium"],
  },
];
export const getRandomFoodsFromCategory = (
  category: RumbleFood["category"],
  count: number
): RumbleFood[] => {
  const categoryFoods = rumbleFoods.filter((food) => food.category === category);
  const shuffled = [...categoryFoods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
export const getDailyRecommendations = (count: number = 10): RumbleFood[] => {
  const proteins = getRandomFoodsFromCategory("protein", Math.ceil(count * 0.3));
  const carbs = getRandomFoodsFromCategory("carb", Math.ceil(count * 0.2));
  const fats = getRandomFoodsFromCategory("fat", Math.ceil(count * 0.1));
  const vegetables = getRandomFoodsFromCategory("vegetable", Math.ceil(count * 0.2));
  const fruits = getRandomFoodsFromCategory("fruit", Math.ceil(count * 0.1));
  const snacks = getRandomFoodsFromCategory("snack", Math.ceil(count * 0.1));
  const allFoods = [...proteins, ...carbs, ...fats, ...vegetables, ...fruits, ...snacks];
  const shuffled = [...allFoods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
export const getRecommendationsByGoal = (
  goal: "weightLoss" | "weightGain" | "maintain",
  count: number = 10
): RumbleFood[] => {
  switch (goal) {
    case "weightLoss":
      const proteins = getRandomFoodsFromCategory("protein", Math.ceil(count * 0.4));
      const vegetables = getRandomFoodsFromCategory("vegetable", Math.ceil(count * 0.3));
      const fruits = getRandomFoodsFromCategory("fruit", Math.ceil(count * 0.1));
      const lowCalCarbs = rumbleFoods
        .filter(food => food.category === "carb" && food.calories < 150)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(count * 0.1));
      const healthyFats = rumbleFoods
        .filter(food => food.category === "fat" && food.calories < 150)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(count * 0.1));

      const allFoods = [...proteins, ...vegetables, ...fruits, ...lowCalCarbs, ...healthyFats];
      return [...allFoods].sort(() => 0.5 - Math.random()).slice(0, count);

    case "weightGain":
      const highProtein = rumbleFoods
        .filter(food => food.category === "protein" && food.protein > 20)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(count * 0.3));
      const calorieRichCarbs = rumbleFoods
        .filter(food => food.category === "carb" && food.calories > 100)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(count * 0.3));
      const calorieRichFats = rumbleFoods
        .filter(food => food.category === "fat" && food.calories > 100)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.ceil(count * 0.2));
      const calorieRichSnacks = getRandomFoodsFromCategory("snack", Math.ceil(count * 0.2));

      const gainFoods = [...highProtein, ...calorieRichCarbs, ...calorieRichFats, ...calorieRichSnacks];
      return [...gainFoods].sort(() => 0.5 - Math.random()).slice(0, count);

    case "maintain":
    default:
      return getDailyRecommendations(count);
  }
};
export const weeklyRecommendations = {
  Monday: getDailyRecommendations(10),
  Tuesday: getDailyRecommendations(10),
  Wednesday: getDailyRecommendations(10),
  Thursday: getDailyRecommendations(10),
  Friday: getDailyRecommendations(10),
  Saturday: getDailyRecommendations(10),
  Sunday: getDailyRecommendations(10),
};
