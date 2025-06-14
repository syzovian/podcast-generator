/*
  # Generate Podcast Summary Function

  1. Purpose
    - Generates concise summaries of podcast scripts using OpenAI's GPT API
    - Creates engaging 2-3 sentence summaries for episode previews
    - Maintains consistent tone and style for the Brainwaves podcast

  2. Features
    - Script-based summary generation
    - Topic-aware summarization
    - Concise, engaging output format
    - Error handling and fallback responses

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
    const { script, topic } = await req.json();

    if (!script || !topic) {
      return new Response(
        JSON.stringify({ error: "Script and topic are required" }),
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

    const prompt = `Create a concise, engaging 2-3 sentence summary of this Brainwaves podcast episode about "${topic}".

The summary should:
- Capture the main points discussed by hosts Alex and Evan
- Be engaging and make people want to listen
- Highlight what makes this episode interesting or unique
- Use an enthusiastic but professional tone
- Be around 40-60 words total

Podcast Script:
${script}

Write only the summary, no additional text or formatting.`;

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
            content: "You are a podcast summary writer who creates compelling, concise episode descriptions that entice listeners while accurately representing the content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary generated");
    }

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate summary" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});