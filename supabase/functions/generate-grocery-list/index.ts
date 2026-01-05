import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DayPlan {
  day: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
}

interface GenerateGroceryRequest {
  weeklyPlan: DayPlan[];
  dietPreference: string;
  servings?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weeklyPlan, dietPreference, servings = 1 }: GenerateGroceryRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Compile all meals into a single string
    const allMeals = weeklyPlan.map(day => 
      `${day.day}:\n- Breakfast: ${day.meals.breakfast}\n- Lunch: ${day.meals.lunch}\n- Dinner: ${day.meals.dinner}\n- Snacks: ${day.meals.snacks}`
    ).join('\n\n');

    const prompt = `You are a professional nutritionist creating a comprehensive weekly grocery shopping list. 
    
Based on the following 7-day meal plan, generate a detailed shopping list with exact quantities for ${servings} person(s).

**Meal Plan:**
${allMeals}

**Diet Preference:** ${dietPreference}

Generate a shopping list in the following JSON format (no markdown, just valid JSON):
{
  "categories": [
    {
      "name": "Produce",
      "icon": "🥬",
      "items": [
        { "name": "Spinach", "quantity": "2 bags", "notes": "fresh" },
        { "name": "Bananas", "quantity": "7", "notes": "" }
      ]
    },
    {
      "name": "Proteins",
      "icon": "🍗",
      "items": [...]
    },
    {
      "name": "Dairy & Eggs",
      "icon": "🥛",
      "items": [...]
    },
    {
      "name": "Grains & Bread",
      "icon": "🍞",
      "items": [...]
    },
    {
      "name": "Pantry Staples",
      "icon": "🫙",
      "items": [...]
    },
    {
      "name": "Frozen",
      "icon": "❄️",
      "items": [...]
    },
    {
      "name": "Oils & Condiments",
      "icon": "🫒",
      "items": [...]
    }
  ],
  "estimatedCost": "<estimated total cost range in USD>",
  "shoppingTips": [
    "<tip 1 for efficient shopping>",
    "<tip 2 about storage>",
    "<tip 3 about substitutions>"
  ]
}

Rules:
- Combine duplicate ingredients across meals (e.g., if chicken appears in 3 meals, calculate total needed)
- Be specific with quantities (e.g., "2 lbs", "500g", "1 dozen", "2 cans")
- Adjust for ${dietPreference} diet (omit meat for vegetarian/vegan, etc.)
- Only include categories that have items
- Add helpful notes for items when relevant (e.g., "organic preferred", "frozen ok")`;

    console.log("[generate-grocery-list] Calling AI gateway...");

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
            content: "You are a professional nutritionist and meal planning expert. Always respond with valid JSON only, no markdown formatting or code blocks." 
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
      console.error("[generate-grocery-list] AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate grocery list");
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

    const groceryList = JSON.parse(cleanedContent);
    console.log("[generate-grocery-list] Successfully generated grocery list");

    return new Response(JSON.stringify(groceryList), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-grocery-list] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
