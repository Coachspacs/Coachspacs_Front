import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
