import React, { useState } from 'react';
import { Copy, Download, FileText, Check } from 'lucide-react';

interface ScriptDisplayProps {
  script: string;
  topic?: string;
}

export function ScriptDisplay({ script, topic }: ScriptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brainwaves-${topic ? topic.toLowerCase().replace(/\s+/g, '-') : 'script'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatScript = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('ALEX:') || line.startsWith('EVAN:')) {
        const [speaker, ...content] = line.split(':');
        return (
          <div key={index} className="mb-4">
            <span className={`font-semibold ${
              speaker === 'ALEX' ? 'text-blue-400' : 'text-orange-400'
            }`}>
              {speaker}:
            </span>
            <span className="text-gray-200 ml-2">{content.join(':').trim()}</span>
          </div>
        );
      }
      return line.trim() ? (
        <div key={index} className="mb-2 text-gray-300 italic">
          {line}
        </div>
      ) : (
        <div key={index} className="mb-2"></div>
      );
    });
  };

  return (
    <div className="glass-morphism glass-script p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">Podcast Script</h3>
            {topic && (
              <p className="text-sm text-gray-400 mt-1">Topic: {topic}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="glass-button p-2 text-gray-300 hover:text-white transition-all duration-200"
            title="Copy script"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleDownload}
            className="glass-button p-2 text-gray-300 hover:text-white transition-all duration-200"
            title="Download script"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-input bg-black/20 rounded-xl p-6 max-h-96 overflow-y-auto font-mono text-sm">
        {formatScript(script)}
      </div>
    </div>
  );
}