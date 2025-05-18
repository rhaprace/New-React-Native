export interface Exercise {
  name: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  videoUrl?: string;
  instructions?: string;
}

export interface DailyWorkout {
  day: string;
  exercises: Exercise[];
}
export const weeklyWorkouts: DailyWorkout[] = [
  {
    day: "Monday",
    exercises: [
      {
        name: "Bench Press",
        type: "strength",
        duration: 45,
        caloriesBurned: 300,
        videoUrl: "bench-press.mp4", // Local video file
        instructions:
          "Lie on a flat bench with your feet on the ground. Grip the barbell slightly wider than shoulder-width. Lower the bar to your chest, then press it back up to the starting position.",
      },
      {
        name: "Dumbbell Bench Press",
        type: "strength",
        duration: 40,
        caloriesBurned: 250,
        videoUrl: "bench-press.mp4",
        instructions:
          "Lie on a flat bench with your feet firmly on the ground. Hold a dumbbell in each hand at chest level. Press the dumbbells straight up until your arms are extended, then slowly lower them back to chest level. Keep your core engaged throughout the movement.",
      },
      {
        name: "Incline Dumbbell Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 200,
        videoUrl: "bench-press.mp4",
        instructions:
          "Set an adjustable bench to a 30-45 degree incline. Hold a dumbbell in each hand at shoulder level. Press the weights upward until your arms are fully extended, then lower them back to the starting position.",
      },
      {
        name: "Tricep Dips",
        type: "strength",
        duration: 15,
        caloriesBurned: 100,
        videoUrl: "tricep-dips.mp4",
        instructions:
          "Position yourself on parallel bars with your arms straight. Lower your body by bending your elbows until your upper arms are parallel to the ground. Push back up to the starting position by straightening your arms.",
      },
    ],
  },
  {
    day: "Tuesday",
    exercises: [
      {
        name: "Pull-Ups",
        type: "strength",
        duration: 30,
        caloriesBurned: 250,
        videoUrl: "pull-ups.mp4",
        instructions:
          "Hang from a pull-up bar with your palms facing away from you and hands slightly wider than shoulder-width. Pull your body up until your chin is above the bar, then lower yourself back to the starting position with control.",
      },
      {
        name: "Barbell Rows",
        type: "strength",
        duration: 40,
        caloriesBurned: 300,
        videoUrl: "barbell-rows.mp4",
        instructions:
          "Bend at the hips and knees, keeping your back straight. Grip a barbell with hands shoulder-width apart. Pull the barbell to your lower chest/upper abdomen, keeping your elbows close to your body. Lower the barbell with control.",
      },
      {
        name: "Bicep Curls",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
        videoUrl: "bicep-curls.mp4",
        instructions:
          "Stand with feet shoulder-width apart, holding dumbbells at your sides with palms facing forward. Keeping your upper arms stationary, curl the weights up to shoulder level. Lower the weights back to the starting position with control.",
      },
    ],
  },
  {
    day: "Wednesday",
    exercises: [
      {
        name: "Running",
        type: "cardio",
        duration: 30,
        caloriesBurned: 400,
        videoUrl: "stretching.mp4", // Using stretching video as a substitute for running
        instructions:
          "Start with a proper warm-up. Maintain good posture with your head up, back straight, and shoulders relaxed. Land midfoot and roll through to push off with your toes. Keep a consistent pace for endurance running.",
      },
      {
        name: "Cycling",
        type: "cardio",
        duration: 45,
        caloriesBurned: 500,
        videoUrl: "squats.mp4", // Using squats video as a substitute for cycling
        instructions:
          "Adjust your bike seat to the proper height. Maintain a steady cadence and proper form. Keep your back straight and core engaged. Vary intensity with intervals for a more effective workout.",
      },
    ],
  },
  {
    day: "Thursday",
    exercises: [
      {
        name: "Squats",
        type: "strength",
        duration: 40,
        caloriesBurned: 350,
        videoUrl: "squats.mp4", // Local video file
        instructions:
          "Stand with feet shoulder-width apart. Lower your body by bending your knees and pushing your hips back as if sitting in a chair. Keep your chest up and back straight. Return to standing position.",
      },
      {
        name: "Lunges",
        type: "strength",
        duration: 30,
        caloriesBurned: 250,
        videoUrl: "lunges.mp4",
        instructions:
          "Stand with feet hip-width apart. Step forward with one leg and lower your body until both knees are bent at 90-degree angles. Push through the front heel to return to the starting position. Repeat with the other leg.",
      },
      {
        name: "Deadlifts",
        type: "strength",
        duration: 30,
        caloriesBurned: 300,
        videoUrl: "deadlifts.mp4",
        instructions:
          "Stand with feet hip-width apart, barbell over your mid-foot. Bend at the hips and knees to grip the bar. Keeping your back straight, lift the bar by extending your hips and knees. Lower the bar back to the floor with control.",
      },
    ],
  },
  {
    day: "Friday",
    exercises: [
      {
        name: "Plank",
        type: "core",
        duration: 10,
        caloriesBurned: 50,
        videoUrl: "plank.mp4", // Local video file
        instructions:
          "Start in a push-up position, then bend your elbows and rest your weight on your forearms. Keep your body in a straight line from head to heels. Engage your core and hold the position.",
      },
      {
        name: "Sit-Ups",
        type: "core",
        duration: 20,
        caloriesBurned: 100,
        videoUrl: "sit-ups.mp4",
        instructions:
          "Lie on your back with knees bent and feet flat on the floor. Place your hands behind your head or across your chest. Engage your core and lift your upper body toward your knees. Lower back down with control.",
      },
      {
        name: "Russian Twists",
        type: "core",
        duration: 15,
        caloriesBurned: 80,
        videoUrl: "russian-twists.mp4",
        instructions:
          "Sit on the floor with knees bent and feet lifted slightly off the ground. Lean back slightly, keeping your back straight. Twist your torso to the right, then to the left, touching the floor on each side with your hands.",
      },
    ],
  },
  {
    day: "Saturday",
    exercises: [
      {
        name: "Yoga",
        type: "flexibility",
        duration: 60,
        caloriesBurned: 200,
        videoUrl: "yoga.mp4", // Using local yoga video
        instructions:
          "Follow along with this beginner-friendly yoga flow. Focus on your breath and move through the poses at your own pace. Maintain proper alignment and modify poses as needed.",
      },
      {
        name: "Stretching",
        type: "flexibility",
        duration: 30,
        caloriesBurned: 100,
        videoUrl: "stretching.mp4",
        instructions:
          "Perform a series of stretches targeting major muscle groups. Hold each stretch for 15-30 seconds without bouncing. Focus on breathing deeply and relaxing into each stretch to improve flexibility.",
      },
    ],
  },
  {
    day: "Sunday",
    exercises: [
      {
        name: "Rest Day",
        type: "rest",
        duration: 0,
        caloriesBurned: 0,
      },
    ],
  },
];
export const weightLossWorkouts: DailyWorkout[] = [
  {
    day: "Monday",
    exercises: [
      {
        name: "HIIT Circuit",
        type: "cardio",
        duration: 30,
        caloriesBurned: 400,
        videoUrl: "squats.mp4", // Using squats video for HIIT demonstration
        instructions:
          "Perform a series of high-intensity exercises with short rest periods. Move quickly between exercises to keep your heart rate elevated. Focus on proper form even when fatigued.",
      },
      {
        name: "Jump Rope",
        type: "cardio",
        duration: 15,
        caloriesBurned: 200,
      },
      {
        name: "Mountain Climbers",
        type: "cardio",
        duration: 10,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Tuesday",
    exercises: [
      {
        name: "Circuit Training",
        type: "strength",
        duration: 45,
        caloriesBurned: 450,
      },
      {
        name: "Burpees",
        type: "cardio",
        duration: 15,
        caloriesBurned: 200,
      },
      {
        name: "Kettlebell Swings",
        type: "strength",
        duration: 15,
        caloriesBurned: 180,
      },
    ],
  },
  {
    day: "Wednesday",
    exercises: [
      {
        name: "Running Intervals",
        type: "cardio",
        duration: 40,
        caloriesBurned: 500,
        videoUrl: "stretching.mp4", // Using stretching video for running intervals
        instructions:
          "Alternate between periods of high-intensity running and recovery periods of walking or jogging. Start with a proper warm-up and end with a cool-down. Focus on maintaining good form throughout.",
      },
      {
        name: "Stair Climbing",
        type: "cardio",
        duration: 20,
        caloriesBurned: 250,
      },
    ],
  },
  {
    day: "Thursday",
    exercises: [
      {
        name: "Bodyweight Circuit",
        type: "strength",
        duration: 40,
        caloriesBurned: 400,
      },
      {
        name: "Box Jumps",
        type: "cardio",
        duration: 15,
        caloriesBurned: 200,
      },
      {
        name: "Battle Ropes",
        type: "cardio",
        duration: 15,
        caloriesBurned: 180,
      },
    ],
  },
  {
    day: "Friday",
    exercises: [
      {
        name: "Swimming",
        type: "cardio",
        duration: 45,
        caloriesBurned: 450,
      },
      {
        name: "Core Circuit",
        type: "core",
        duration: 20,
        caloriesBurned: 200,
      },
    ],
  },
  {
    day: "Saturday",
    exercises: [
      {
        name: "Cycling Intervals",
        type: "cardio",
        duration: 45,
        caloriesBurned: 500,
      },
      {
        name: "Rowing",
        type: "cardio",
        duration: 20,
        caloriesBurned: 250,
      },
    ],
  },
  {
    day: "Sunday",
    exercises: [
      {
        name: "Active Recovery (Walking)",
        type: "cardio",
        duration: 60,
        caloriesBurned: 250,
      },
      {
        name: "Stretching",
        type: "flexibility",
        duration: 20,
        caloriesBurned: 80,
      },
    ],
  },
];
export const weightGainWorkouts: DailyWorkout[] = [
  {
    day: "Monday",
    exercises: [
      {
        name: "Bench Press (Heavy)",
        type: "strength",
        duration: 40,
        caloriesBurned: 250,
        videoUrl: "bench-press.mp4",
        instructions:
          "Lie on a flat bench with your feet firmly on the ground. Grip the barbell slightly wider than shoulder-width. Lower the bar to your chest with control, then press it back up to the starting position. Focus on using heavier weights with proper form.",
      },
      {
        name: "Shoulder Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 200,
      },
      {
        name: "Tricep Extensions",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Tuesday",
    exercises: [
      {
        name: "Deadlifts (Heavy)",
        type: "strength",
        duration: 40,
        caloriesBurned: 300,
        videoUrl: "deadlifts.mp4",
        instructions:
          "Stand with feet hip-width apart, barbell over your mid-foot. Bend at the hips and knees to grip the bar with a shoulder-width grip. Keeping your back straight, lift the bar by extending your hips and knees. Focus on using heavier weights with proper form to maximize muscle growth.",
      },
      {
        name: "Barbell Rows",
        type: "strength",
        duration: 30,
        caloriesBurned: 250,
      },
      {
        name: "Lat Pulldowns",
        type: "strength",
        duration: 20,
        caloriesBurned: 180,
      },
      {
        name: "Bicep Curls",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Wednesday",
    exercises: [
      {
        name: "Light Cardio",
        type: "cardio",
        duration: 20,
        caloriesBurned: 150,
      },
      {
        name: "Stretching",
        type: "flexibility",
        duration: 20,
        caloriesBurned: 80,
      },
    ],
  },
  {
    day: "Thursday",
    exercises: [
      {
        name: "Squats (Heavy)",
        type: "strength",
        duration: 40,
        caloriesBurned: 300,
        videoUrl: "squats.mp4",
        instructions:
          "Stand with feet shoulder-width apart. Hold a barbell across your upper back. Lower your body by bending your knees and pushing your hips back as if sitting in a chair. Keep your chest up and back straight. Return to standing position. Focus on using heavier weights with proper form.",
      },
      {
        name: "Leg Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 250,
      },
      {
        name: "Leg Extensions",
        type: "strength",
        duration: 20,
        caloriesBurned: 180,
      },
      {
        name: "Calf Raises",
        type: "strength",
        duration: 15,
        caloriesBurned: 120,
      },
    ],
  },
  {
    day: "Friday",
    exercises: [
      {
        name: "Overhead Press",
        type: "strength",
        duration: 30,
        caloriesBurned: 200,
      },
      {
        name: "Dumbbell Flyes",
        type: "strength",
        duration: 25,
        caloriesBurned: 180,
      },
      {
        name: "Tricep Pushdowns",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Saturday",
    exercises: [
      {
        name: "Pull-Ups",
        type: "strength",
        duration: 25,
        caloriesBurned: 200,
      },
      {
        name: "Dumbbell Rows",
        type: "strength",
        duration: 25,
        caloriesBurned: 180,
      },
      {
        name: "Hammer Curls",
        type: "strength",
        duration: 20,
        caloriesBurned: 150,
      },
    ],
  },
  {
    day: "Sunday",
    exercises: [
      {
        name: "Rest Day",
        type: "rest",
        duration: 0,
        caloriesBurned: 0,
      },
    ],
  },
];
export const getWorkoutsByGoal = (
  goal: "loss" | "gain" | "maintain"
): DailyWorkout[] => {
  switch (goal) {
    case "loss":
      return weightLossWorkouts;
    case "gain":
      return weightGainWorkouts;
    case "maintain":
    default:
      return weeklyWorkouts;
  }
};
