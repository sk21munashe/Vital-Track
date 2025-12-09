import { FoodItem } from '@/types/wellness';

export const commonFoods: FoodItem[] = [
  // Breakfast
  { id: 'oatmeal', name: 'Oatmeal (1 cup)', calories: 158, protein: 6, carbs: 27, fat: 3, servingSize: '1 cup' },
  { id: 'eggs', name: 'Eggs (2 large)', calories: 156, protein: 12, carbs: 1, fat: 11, servingSize: '2 eggs' },
  { id: 'toast', name: 'Whole Wheat Toast', calories: 80, protein: 4, carbs: 15, fat: 1, servingSize: '1 slice' },
  { id: 'banana', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, servingSize: '1 medium' },
  { id: 'yogurt', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 1, servingSize: '170g' },
  { id: 'coffee', name: 'Coffee with Milk', calories: 30, protein: 1, carbs: 3, fat: 1, servingSize: '1 cup' },
  { id: 'orange-juice', name: 'Orange Juice', calories: 112, protein: 2, carbs: 26, fat: 0, servingSize: '1 cup' },
  { id: 'cereal', name: 'Cereal with Milk', calories: 220, protein: 8, carbs: 40, fat: 4, servingSize: '1 bowl' },
  
  // Lunch
  { id: 'chicken-breast', name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, servingSize: '100g' },
  { id: 'rice', name: 'White Rice', calories: 206, protein: 4, carbs: 45, fat: 0, servingSize: '1 cup' },
  { id: 'brown-rice', name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 2, servingSize: '1 cup' },
  { id: 'salad', name: 'Garden Salad', calories: 50, protein: 2, carbs: 10, fat: 1, servingSize: '1 bowl' },
  { id: 'sandwich', name: 'Turkey Sandwich', calories: 350, protein: 25, carbs: 35, fat: 12, servingSize: '1 sandwich' },
  { id: 'soup', name: 'Vegetable Soup', calories: 120, protein: 4, carbs: 20, fat: 3, servingSize: '1 bowl' },
  { id: 'pasta', name: 'Pasta with Tomato Sauce', calories: 350, protein: 12, carbs: 65, fat: 5, servingSize: '1 plate' },
  
  // Dinner
  { id: 'salmon', name: 'Grilled Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g' },
  { id: 'steak', name: 'Beef Steak', calories: 271, protein: 26, carbs: 0, fat: 18, servingSize: '100g' },
  { id: 'pizza', name: 'Pizza Slice', calories: 285, protein: 12, carbs: 36, fat: 10, servingSize: '1 slice' },
  { id: 'burger', name: 'Cheeseburger', calories: 500, protein: 28, carbs: 40, fat: 25, servingSize: '1 burger' },
  { id: 'sushi', name: 'Sushi Roll (8 pcs)', calories: 350, protein: 15, carbs: 50, fat: 8, servingSize: '8 pieces' },
  { id: 'curry', name: 'Chicken Curry with Rice', calories: 550, protein: 30, carbs: 55, fat: 20, servingSize: '1 plate' },
  
  // Snacks
  { id: 'apple', name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0, servingSize: '1 medium' },
  { id: 'almonds', name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14, servingSize: '28g' },
  { id: 'protein-bar', name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 6, servingSize: '1 bar' },
  { id: 'chips', name: 'Potato Chips', calories: 160, protein: 2, carbs: 15, fat: 10, servingSize: '1 oz' },
  { id: 'cookie', name: 'Chocolate Chip Cookie', calories: 78, protein: 1, carbs: 10, fat: 4, servingSize: '1 cookie' },
  { id: 'smoothie', name: 'Fruit Smoothie', calories: 180, protein: 5, carbs: 35, fat: 2, servingSize: '1 cup' },
  { id: 'nuts-mixed', name: 'Mixed Nuts', calories: 172, protein: 5, carbs: 7, fat: 15, servingSize: '1 oz' },
  
  // Drinks
  { id: 'soda', name: 'Soda', calories: 140, protein: 0, carbs: 39, fat: 0, servingSize: '12 oz' },
  { id: 'protein-shake', name: 'Protein Shake', calories: 150, protein: 25, carbs: 8, fat: 3, servingSize: '1 shake' },
  { id: 'milk', name: 'Whole Milk', calories: 149, protein: 8, carbs: 12, fat: 8, servingSize: '1 cup' },
  { id: 'tea', name: 'Tea (unsweetened)', calories: 2, protein: 0, carbs: 0, fat: 0, servingSize: '1 cup' },
];

export const activityTypes = [
  { id: 'walking', name: 'Walking', caloriesPerMinute: 5, icon: '🚶' },
  { id: 'running', name: 'Running', caloriesPerMinute: 12, icon: '🏃' },
  { id: 'cycling', name: 'Cycling', caloriesPerMinute: 8, icon: '🚴' },
  { id: 'swimming', name: 'Swimming', caloriesPerMinute: 10, icon: '🏊' },
  { id: 'gym', name: 'Gym Workout', caloriesPerMinute: 7, icon: '🏋️' },
  { id: 'yoga', name: 'Yoga', caloriesPerMinute: 3, icon: '🧘' },
  { id: 'hiit', name: 'HIIT Training', caloriesPerMinute: 14, icon: '💪' },
  { id: 'dancing', name: 'Dancing', caloriesPerMinute: 6, icon: '💃' },
  { id: 'hiking', name: 'Hiking', caloriesPerMinute: 7, icon: '🥾' },
  { id: 'sports', name: 'Team Sports', caloriesPerMinute: 9, icon: '⚽' },
];

export const motivationalQuotes = [
  "Every step counts towards a healthier you! 💪",
  "Your only limit is you. Keep pushing! 🌟",
  "Small progress is still progress. 🎯",
  "Believe you can and you're halfway there. ✨",
  "Today is a great day to be healthy! 🌈",
  "You're stronger than you think! 💎",
  "Consistency is the key to success. 🔑",
  "Make yourself proud today! 🏆",
  "Health is wealth. Invest in yourself! 💰",
  "Your body will thank you later! 🙏",
];
