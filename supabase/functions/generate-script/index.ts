/*
  # Generate Podcast Script Function

  1. Purpose
    - Generates conversational podcast scripts using OpenAI's GPT API
    - Creates natural dialogue between hosts Alex and Evan
    - Formats content for the "Brainwaves" podcast

  2. Features
    - Topic-based script generation
    - Structured dialogue with speaker labels
    - Natural conversation flow with proper pacing
    - Integrated opening and closing segments

  3. Security
    - CORS headers for cross-origin requests
    - Environment variable protection for API keys
    - Input validation and error handling
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { topic } = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `Create a natural, conversational 3-5 minute podcast script for "Brainwaves" with hosts Alex and Evan discussing: ${topic}

Requirements:
- Alex starts with opening introduction mentioning "Brainwaves"
- Natural, engaging dialogue with balanced contributions
- Clear speaker labels (ALEX: and EVAN:)
- Casual, friendly tone between hosts
- Include natural transitions and conversational elements
- Alex closes with "Thank you for riding the Brainwaves with me and Evan!"
- Format for text-to-speech with proper pacing and natural pauses

Structure:
1. Opening (Alex introduces the podcast)
2. Topic introduction and discussion
3. Main conversation with back-and-forth dialogue
4. Closing remarks (Alex with signature sign-off)

Make it sound like two friends having an interesting conversation, not a formal interview.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a podcast script writer who creates natural, engaging conversations between two hosts. Focus on making the dialogue feel authentic and conversational, not scripted."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const script = data.choices[0]?.message?.content;

    if (!script) {
      throw new Error("No script generated");
    }

    return new Response(
      JSON.stringify({ script }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating script:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate script" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});