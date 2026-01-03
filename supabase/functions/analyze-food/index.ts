import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing food image with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional nutritionist and food analyst. Analyze food images and provide accurate nutritional information.

When analyzing a food image, you must:
1. Identify all visible food items
2. Estimate portion sizes based on visual cues
3. Calculate approximate calories and macronutrients

IMPORTANT: You must respond ONLY with a valid JSON object in this exact format, no additional text:
{
  "foods": [
    {
      "name": "Food item name",
      "portion": "Estimated portion size (e.g., '1 cup', '200g')",
      "calories": 250,
      "protein": 15,
      "carbs": 30,
      "fat": 8
    }
  ],
  "totalCalories": 500,
  "totalProtein": 30,
  "totalCarbs": 60,
  "totalFat": 16,
  "confidence": "high",
  "notes": "Any relevant notes about the food or estimation"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this food image and provide detailed nutritional information. Identify each food item, estimate portion sizes, and calculate calories and macronutrients (protein, carbs, fat in grams).'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_food",
              description: "Return nutritional analysis of food items in the image",
              parameters: {
                type: "object",
                properties: {
                  foods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name of the food item" },
                        portion: { type: "string", description: "Estimated portion size" },
                        calories: { type: "number", description: "Estimated calories" },
                        protein: { type: "number", description: "Protein in grams" },
                        carbs: { type: "number", description: "Carbohydrates in grams" },
                        fat: { type: "number", description: "Fat in grams" }
                      },
                      required: ["name", "portion", "calories", "protein", "carbs", "fat"]
                    }
                  },
                  totalCalories: { type: "number" },
                  totalProtein: { type: "number" },
                  totalCarbs: { type: "number" },
                  totalFat: { type: "number" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                  notes: { type: "string" }
                },
                required: ["foods", "totalCalories", "totalProtein", "totalCarbs", "totalFat", "confidence"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_food" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze food image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      console.log('Food analysis:', analysis);
      
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify(analysis),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.error('Failed to parse content as JSON:', e);
      }
    }

    return new Response(
      JSON.stringify({ error: 'Could not analyze the food image. Please try again with a clearer image.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
