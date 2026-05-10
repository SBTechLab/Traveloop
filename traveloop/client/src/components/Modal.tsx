import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleKey);
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleKey); };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card w-full ${sizes[size]} animate-slide-up shadow-2xl`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
