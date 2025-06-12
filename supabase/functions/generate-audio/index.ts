/*
  # Generate Podcast Audio Function

  1. Purpose
    - Converts podcast scripts to audio using ElevenLabs API
    - Combines multiple voice segments into a single audio file
    - Handles speaker-specific voice synthesis

  2. Features
    - Multi-voice audio generation (Alex and Evan)
    - Script parsing and speaker identification
    - Audio segment combination and timing
    - High-quality voice synthesis

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
    const { script } = await req.json();

    if (!script) {
      return new Response(
        JSON.stringify({ error: "Script is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const elevenlabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    const alexVoiceId = Deno.env.get("ALEX_VOICE_ID");
    const evanVoiceId = Deno.env.get("EVAN_VOICE_ID");

    console.log("Environment check:", {
      hasElevenlabsKey: !!elevenlabsApiKey,
      hasAlexVoice: !!alexVoiceId,
      hasEvanVoice: !!evanVoiceId
    });

    if (!elevenlabsApiKey) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY environment variable is not set. Please add it in your Supabase Edge Functions settings." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!alexVoiceId || !evanVoiceId) {
      return new Response(
        JSON.stringify({ error: "Voice IDs not configured. Please set ALEX_VOICE_ID and EVAN_VOICE_ID in your Supabase Edge Functions settings." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse script into segments
    const segments = parseScript(script);
    console.log(`Parsed ${segments.length} segments from script`);
    
    if (segments.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid dialogue segments found in script. Make sure the script contains ALEX: and EVAN: speaker labels." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate audio for each segment
    const audioSegments = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`Processing segment ${i + 1}/${segments.length}: ${segment.speaker}`);
      
      if (segment.speaker && segment.text.trim()) {
        try {
          const voiceId = segment.speaker === 'ALEX' ? alexVoiceId : evanVoiceId;
          const audioData = await generateVoiceSegment(segment.text, voiceId, elevenlabsApiKey);
          audioSegments.push(audioData);
          console.log(`Successfully generated audio for segment ${i + 1}`);
        } catch (error) {
          console.error(`Failed to generate audio for segment ${i + 1}:`, error);
          return new Response(
            JSON.stringify({ error: `Failed to generate audio for ${segment.speaker}: ${error.message}` }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    if (audioSegments.length === 0) {
      return new Response(
        JSON.stringify({ error: "No audio segments were generated successfully" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Combining ${audioSegments.length} audio segments`);
    
    // Combine audio segments
    const combinedAudio = await combineAudioSegments(audioSegments);

    return new Response(combinedAudio, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=podcast.mp3",
      },
    });
  } catch (error) {
    console.error("Error generating audio:", error);
    
    let errorMessage = "Failed to generate audio";
    if (error.message.includes("fetch")) {
      errorMessage = "Network error connecting to ElevenLabs API. Please check your internet connection.";
    } else if (error.message.includes("API key")) {
      errorMessage = "Invalid ElevenLabs API key. Please check your API key configuration.";
    } else if (error.message.includes("voice")) {
      errorMessage = "Invalid voice ID. Please check your ALEX_VOICE_ID and EVAN_VOICE_ID configuration.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function parseScript(script: string) {
  const lines = script.split('\n');
  const segments = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('ALEX:')) {
      const text = trimmedLine.substring(5).trim();
      if (text.length > 0) {
        segments.push({
          speaker: 'ALEX',
          text: text
        });
      }
    } else if (trimmedLine.startsWith('EVAN:')) {
      const text = trimmedLine.substring(5).trim();
      if (text.length > 0) {
        segments.push({
          speaker: 'EVAN',
          text: text
        });
      }
    }
  }
  
  return segments;
}

async function generateVoiceSegment(text: string, voiceId: string, apiKey: string): Promise<Uint8Array> {
  console.log(`Generating voice for text: "${text.substring(0, 50)}..." with voice ID: ${voiceId}`);
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.5,
        use_speaker_boost: true
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ElevenLabs API error: ${response.status} ${response.statusText}`, errorText);
    
    if (response.status === 401) {
      throw new Error("Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY configuration.");
    } else if (response.status === 422) {
      throw new Error(`Invalid voice ID: ${voiceId}. Please check your voice ID configuration.`);
    } else if (response.status === 429) {
      throw new Error("ElevenLabs API rate limit exceeded. Please try again later.");
    } else {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function combineAudioSegments(segments: Uint8Array[]): Promise<Uint8Array> {
  // Simple concatenation for MVP - in production, you'd want proper audio mixing
  let totalLength = 0;
  for (const segment of segments) {
    totalLength += segment.length;
  }

  const combined = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const segment of segments) {
    combined.set(segment, offset);
    offset += segment.length;
  }

  return combined;
}