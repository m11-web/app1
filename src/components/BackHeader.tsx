import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  right?: React.ReactNode;
  bg?: string;
  dark?: boolean;
}

export default function BackHeader({ title, right, bg = 'bg-white dark:bg-gray-900', dark }: Props) {
  const nav = useNavigate();
  return (
    <div className={`${bg} px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800`}>
      <button
        onClick={() => nav(-1)}
        className={`w-9 h-9 flex items-center justify-center rounded-full ${dark ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white'}`}
      >
        ←
      </button>
      <h1 className={`font-extrabold text-lg ${dark ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</h1>
      <div className="w-9">{right}</div>
    </div>
  );
}
