# Brainwaves Podcast Generator

A modern AI-powered podcast generator that creates dynamic conversations between hosts Evan and Alex on any topic, featuring beautiful glass morphism UI design.

## Features

- 🎙️ **AI Script Generation**: Creates natural, conversational podcast scripts using OpenAI's GPT-4
- 🔊 **Voice Synthesis**: Converts scripts to high-quality audio using ElevenLabs AI voices
- 🎨 **Glass Morphism UI**: Beautiful Apple-inspired liquid glass design
- 📱 **Responsive Design**: Works seamlessly across all devices
- 🎵 **Audio Player**: Full-featured player with controls and download options
- 📝 **Script Display**: Formatted script view with copy and download functionality

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd brainwaves-podcast-generator
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Click "Connect to Supabase" in the app (top right corner)

3. **Configure API Keys**
   In your Supabase Dashboard → Edge Functions → Settings, add these environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ALEX_VOICE_ID=your_alex_voice_id_here
   EVAN_VOICE_ID=your_evan_voice_id_here
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## Deployment

### Netlify Deployment

1. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Configure Environment Variables in Netlify**
   In your Netlify Dashboard → Site Settings → Environment Variables, add:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Redeploy**
   - Trigger a new deployment after adding environment variables
   - The app should now work correctly in production

### Important Notes for Production

- **Environment Variables**: Make sure to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your deployment platform
- **API Keys**: The OpenAI and ElevenLabs API keys are configured in Supabase Edge Functions, not in the frontend
- **Security**: Never expose API keys in frontend code - they're safely stored in Supabase

## Getting API Keys

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

### ElevenLabs API Key & Voice IDs
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Create an account or sign in
3. Go to your Profile → API Keys to get your API key
4. Go to Voices section to find or create voice IDs for Alex and Evan

## Environment Variables

**Frontend (.env file for local development):**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Frontend (Netlify Environment Variables for production):**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (Supabase Edge Functions):**
```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ALEX_VOICE_ID=your_alex_voice_id
EVAN_VOICE_ID=your_evan_voice_id
```

## Usage

1. Enter a topic you'd like the hosts to discuss
2. Click "Generate Brainwaves Episode"
3. Wait for the script generation and audio synthesis
4. Listen to your custom podcast episode!

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **AI Services**: OpenAI GPT-4 for scripts, ElevenLabs for voice synthesis
- **Styling**: Custom glass morphism CSS with liquid animations

## Security

All API keys are stored securely as environment variables and never exposed in the client-side code. The application uses Supabase Edge Functions to handle all external API calls securely.

## Troubleshooting

### Deployment Issues

**"Setup Required" showing on deployed site:**
- Make sure you've added `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your deployment platform's environment variables
- Redeploy after adding environment variables
- Check that the environment variable names are exactly correct (including the `VITE_` prefix)

**"Failed to generate podcast" error:**
- Make sure you've set up Supabase and connected your project
- Verify all environment variables are set in Supabase Edge Functions
- Check that your API keys are valid and have sufficient credits

**Setup issues:**
- Use the "Connect to Supabase" button in the app for easy setup
- Follow the step-by-step instructions in the setup notice

### Common Deployment Platform Instructions

**Netlify:**
1. Site Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy

**Vercel:**
1. Project Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy

**Railway:**
1. Variables tab
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details