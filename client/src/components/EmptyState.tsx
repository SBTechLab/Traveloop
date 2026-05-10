import React from 'react';

interface EmptyStateProps {
  icon?: string; // Material Symbol name, e.g. 'search', 'luggage', 'map'
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-4xl text-primary-container">{icon}</span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-on-surface mb-2">{title}</h3>
      {description && <p className="text-on-surface-variant max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
