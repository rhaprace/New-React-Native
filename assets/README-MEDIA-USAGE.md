# Media Assets Usage Guide

This document explains how to use video assets in the workout components.

## Video Assets

Video assets are stored in the `assets/videos` directory. The following videos are currently supported:

- `bench-press.mp4`
- `squats.mp4`
- `plank.mp4`
- `bicep-curls.mp4`
- `deadlifts.mp4`
- `lunges.mp4`
- `pull-ups.mp4`
- `russian-twists.mp4`
- `sit-ups.mp4`
- `stretching.mp4`
- `tricep-dips.mp4`
- `yoga.mp4`
- `barbell-rows.mp4`

To add a new video:

1. Place the video file in the `assets/videos` directory
2. Update the `getExerciseVideo` function in `app/workout/[day].tsx` to include the new video file
3. Reference the video in the `workoutData.ts` file using the filename (e.g., `videoUrl: "new-exercise.mp4"`)

## Using Media in Workout Data

In the `constants/workoutData.ts` file, you can specify a video for each exercise:

```javascript
{
  name: "Bench Press",
  type: "strength",
  duration: 45,
  caloriesBurned: 300,
  videoUrl: "bench-press.mp4", // Local video file
  // OR
  videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg", // External URL
  instructions: "Exercise instructions here...",
}
```

The app will display media in the following priority:

1. Video (if `videoUrl` is provided)
2. Placeholder (if no video is provided)

## Fallback Behavior

If a referenced video file is not found, the app will display a placeholder with a dumbbell icon.
