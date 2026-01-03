import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthProfile {
  gender: string;
  age: number;
  height: number;
  weight: number;
  units: 'metric' | 'imperial';
  healthGoal: string;
  activityLevel: string;
  dietPreference: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const profile: HealthProfile = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Convert imperial to metric for calculations if needed
    let weightKg = profile.weight;
    let heightCm = profile.height;
    
    if (profile.units === 'imperial') {
      weightKg = profile.weight * 0.453592; // lbs to kg
      heightCm = profile.height * 2.54; // inches to cm
    }

    const prompt = `You are a certified nutritionist and fitness coach. Create a personalized 7-day health plan based on the following user profile:

**User Profile:**
- Gender: ${profile.gender}
- Age: ${profile.age} years
- Height: ${heightCm.toFixed(1)} cm (${profile.height} ${profile.units === 'imperial' ? 'inches' : 'cm'})
- Weight: ${weightKg.toFixed(1)} kg (${profile.weight} ${profile.units === 'imperial' ? 'lbs' : 'kg'})
- Health Goal: ${profile.healthGoal}
- Activity Level: ${profile.activityLevel}
- Diet Preference: ${profile.dietPreference}

Please provide a response in the following JSON format (no markdown, just valid JSON):
{
  "dailyCalories": <number>,
  "macros": {
    "protein": <grams as number>,
    "carbs": <grams as number>,
    "fats": <grams as number>
  },
  "weeklyPlan": [
    {
      "day": "Day 1",
      "meals": {
        "breakfast": "<meal description>",
        "lunch": "<meal description>",
        "dinner": "<meal description>",
        "snacks": "<snack suggestions>"
      },
      "waterGoal": <liters as number>,
      "exerciseSuggestion": "<exercise for the day>"
    }
  ],
  "recommendations": [
    "<specific tip 1 based on user's goal and diet>",
    "<specific tip 2 based on user's goal and diet>",
    "<specific tip 3 based on user's goal and diet>"
  ],
  "bmr": <number>,
  "tdee": <number>
}

Make the plan specific to their ${profile.dietPreference} diet preference and ${profile.healthGoal} goal. Include 7 days in the weeklyPlan array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a professional nutritionist and fitness coach. Always respond with valid JSON only, no markdown formatting or code blocks." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate health plan");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    // Parse the JSON response
    const healthPlan = JSON.parse(cleanedContent);

    return new Response(JSON.stringify(healthPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-health-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
