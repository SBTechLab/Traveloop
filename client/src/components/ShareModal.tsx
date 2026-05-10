import React, { useState } from 'react';
import { X, Send, Plus, Mail } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface ShareModalProps {
  tripId: string;
  tripName: string;
  onClose: () => void;
}

export default function ShareModal({ tripId, tripName, onClose }: ShareModalProps) {
  const [emails, setEmails] = useState<string[]>(['']);
  const [isSending, setIsSending] = useState(false);

  const addEmail = () => setEmails([...emails, '']);
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };
  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const handleShare = async () => {
    const validEmails = emails.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email');
      return;
    }

    setIsSending(true);
    try {
      await api.post(`/trips/${tripId}/share`, { emails: validEmails });
      toast.success(`Itinerary shared with ${validEmails.length} friends!`);
      onClose();
    } catch (error) {
      toast.error('Failed to share itinerary');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface-container border border-outline-variant rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">Share your Journey</h2>
              <p className="text-on-surface-variant text-sm">Invite friends to view <b>{tripName}</b></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {emails.map((email, idx) => (
              <div key={idx} className="flex gap-2 group">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    placeholder="friend@email.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all"
                  />
                </div>
                {emails.length > 1 && (
                  <button 
                    onClick={() => removeEmail(idx)}
                    className="p-4 text-error hover:bg-error-container/10 rounded-2xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={addEmail}
            className="mt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Another Friend
          </button>

          <div className="mt-12 flex gap-4">
            <button onClick={onClose} className="flex-1 btn-secondary justify-center py-4">
              Cancel
            </button>
            <button 
              onClick={handleShare}
              disabled={isSending}
              className="flex-1 btn-primary justify-center py-4 shadow-xl shadow-primary/20"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invites
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
