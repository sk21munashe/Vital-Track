import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MealSwapRequest {
  currentMeal: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  dietPreference: string;
  healthGoal: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  reason?: string; // Optional reason for swap (e.g., "don't like fish", "want something quicker")
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      currentMeal, 
      mealType, 
      dietPreference, 
      healthGoal, 
      dailyCalories,
      macros,
      reason 
    }: MealSwapRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const mealTypeLabels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch', 
      dinner: 'Dinner',
      snacks: 'Snacks'
    };

    const prompt = `You are a certified nutritionist. A user wants to swap their ${mealTypeLabels[mealType]} meal.

**Current Meal:** ${currentMeal}
**Diet Preference:** ${dietPreference}
**Health Goal:** ${healthGoal}
**Daily Calorie Target:** ${dailyCalories} kcal
**Daily Macro Targets:** ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fats}g fats
${reason ? `**Reason for swap:** ${reason}` : ''}

Please suggest 3 alternative meals that:
1. Have similar or better nutritional value
2. Fit the ${dietPreference} diet
3. Support the ${healthGoal} goal
4. Are appropriate for ${mealTypeLabels[mealType]}

Respond in the following JSON format (no markdown, just valid JSON):
{
  "alternatives": [
    {
      "name": "<concise meal name>",
      "description": "<full meal description with portions>",
      "calories": <approximate calories as number>,
      "macros": {
        "protein": <grams>,
        "carbs": <grams>,
        "fats": <grams>
      },
      "prepTime": "<estimated prep time>",
      "tags": ["<tag1>", "<tag2>"],
      "whyGood": "<1 sentence explaining why this is a good alternative>"
    }
  ]
}

Make sure alternatives are varied (e.g., one quick option, one high-protein option, one crowd favorite).`;

    console.log("[suggest-meal-swap] Calling AI gateway for", mealType);

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
            content: "You are a professional nutritionist specializing in personalized meal planning. Always respond with valid JSON only, no markdown formatting or code blocks." 
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
      console.error("[suggest-meal-swap] AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate meal alternatives");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // Clean the response
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

    const suggestions = JSON.parse(cleanedContent);
    console.log("[suggest-meal-swap] Successfully generated alternatives");

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[suggest-meal-swap] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
