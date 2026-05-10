import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-6xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-gray-500 max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
