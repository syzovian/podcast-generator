import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

export function SetupNotice() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Don't show if Supabase is already configured
  if (supabaseUrl && supabaseAnonKey) {
    return null;
  }

  return (
    <div className="glass-morphism glass-setup p-6 mb-8">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Setup Required</h3>
          <p className="text-gray-300 mb-4">
            To generate podcasts, you need to connect this app to Supabase and configure your API keys.
          </p>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-400">
              <strong className="text-white">Step 1:</strong> Click "Connect to Supabase" in the top right corner
            </div>
            <div className="text-sm text-gray-400">
              <strong className="text-white">Step 2:</strong> In your Supabase Dashboard, go to Edge Functions and add these environment variables:
              <ul className="mt-2 ml-4 space-y-1">
                <li>• OPENAI_API_KEY</li>
                <li>• ELEVENLABS_API_KEY</li>
                <li>• ALEX_VOICE_ID</li>
                <li>• EVAN_VOICE_ID</li>
              </ul>
            </div>
          </div>

          <a
            href="https://github.com/your-repo/brainwaves#setup"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 glass-button px-4 py-2 text-sm text-blue-300 hover:text-blue-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Setup Instructions
          </a>
        </div>
      </div>
    </div>
  );
}