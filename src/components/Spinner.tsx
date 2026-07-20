import React from 'react';

export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
