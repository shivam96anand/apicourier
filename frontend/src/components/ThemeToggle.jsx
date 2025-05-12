import React from 'react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
      <button onClick={onToggle} className="ml-4 text-sm text-gray-300 hover:text-white">
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
  );
}
