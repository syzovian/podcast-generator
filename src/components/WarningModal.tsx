import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function WarningModal({ isOpen, onClose, title, message }: WarningModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="glass-morphism glass-modal p-6 max-w-sm w-full mx-auto">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="glass-button p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="glass-button py-2 px-4 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}