import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8 text-gray-500 dark:text-gray-400">
      <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
