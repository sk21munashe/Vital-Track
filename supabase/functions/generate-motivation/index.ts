import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserProgress {
  waterIntake: number;
  waterGoal: number;
  caloriesConsumed: number;
  calorieGoal: number;
  streak: number;
  yesterdayWater: number;
  weeklyGoalsMet: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { progress, timeOfDay } = await req.json() as { 
      progress: UserProgress; 
      timeOfDay: 'morning' | 'afternoon' | 'evening';
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Return a local fallback message if no API key
      return new Response(
        JSON.stringify({ message: getLocalMessage(progress, timeOfDay) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const waterPercent = Math.round((progress.waterIntake / progress.waterGoal) * 100);
    const caloriePercent = Math.round((progress.caloriesConsumed / progress.calorieGoal) * 100);
    const waterRemaining = progress.waterGoal - progress.waterIntake;
    const caloriesRemaining = progress.calorieGoal - progress.caloriesConsumed;

    const systemPrompt = `You are a friendly, encouraging wellness coach for a health tracking app called VitalTrack. 
Your job is to create short, personalized motivational messages (max 100 characters) based on user progress.

Guidelines:
- Be warm, supportive, and encouraging
- Use 1-2 relevant emojis
- Be specific to their actual progress numbers
- Never be preachy or judgmental
- Keep messages under 100 characters
- Sound human and friendly, not robotic`;

    const userPrompt = `Generate a motivational notification message for this user:

Time of day: ${timeOfDay}
Water progress: ${waterPercent}% (${progress.waterIntake}ml of ${progress.waterGoal}ml, ${waterRemaining}ml remaining)
Calorie progress: ${caloriePercent}% (${progress.caloriesConsumed} of ${progress.calorieGoal} cal, ${caloriesRemaining} remaining)
Current streak: ${progress.streak} days
Yesterday's water: ${progress.yesterdayWater}ml
Weekly goals met: ${progress.weeklyGoalsMet} days

Create a short, personalized message that:
1. Acknowledges their specific progress
2. Provides encouragement appropriate for the time of day
3. Is under 100 characters
4. Includes 1-2 emojis
5. Feels personal and human

Just respond with the message text only, no quotes or extra formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limited");
        return new Response(
          JSON.stringify({ message: getLocalMessage(progress, timeOfDay) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ message: getLocalMessage(progress, timeOfDay) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ message: getLocalMessage(progress, timeOfDay) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || getLocalMessage(progress, timeOfDay);

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating motivation:", error);
    return new Response(
      JSON.stringify({ 
        message: "Keep going! Every step on your wellness journey counts! ✨",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 200, // Return 200 with fallback message
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function getLocalMessage(progress: UserProgress, timeOfDay: string): string {
  const waterPercent = Math.round((progress.waterIntake / progress.waterGoal) * 100);
  const caloriePercent = Math.round((progress.caloriesConsumed / progress.calorieGoal) * 100);
  const waterRemaining = progress.waterGoal - progress.waterIntake;

  // Water reminders
  if (waterPercent < 50 && timeOfDay !== 'morning') {
    return `Your body is 60% water—let's hydrate! 💧 Only ${waterRemaining}ml to go!`;
  }

  // Close to calorie goal
  if (caloriePercent >= 80 && caloriePercent <= 100) {
    return `You're killing it! 🎯 Only ${progress.calorieGoal - progress.caloriesConsumed} calories left today.`;
  }

  // Streak motivation
  if (progress.streak >= 3) {
    return `${progress.streak}-day streak! Don't break the chain! 🔥`;
  }

  // Missed yesterday
  if (progress.yesterdayWater < progress.waterGoal * 0.5) {
    return "Today's a fresh start. Let's get back on track! 🌟";
  }

  // Consistently hitting goals
  if (progress.weeklyGoalsMet >= 5) {
    return "AI Tip: You're on fire! Try adding more protein for energy! 💪";
  }

  // Time-based defaults
  switch (timeOfDay) {
    case 'morning':
      return "Good morning! Start strong and make today count! ☀️";
    case 'afternoon':
      return "Keep the momentum going! You're doing great! 🚀";
    case 'evening':
      return "Finish the day well! You're almost there! 🌙";
    default:
      return "Every step counts on your wellness journey! ✨";
  }
}
