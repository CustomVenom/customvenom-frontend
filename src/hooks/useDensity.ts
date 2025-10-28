'use client';
import { useLayoutEffect, useState } from 'react';

export function useDensity() {
  const [dense, setDense] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('density') === 'compact';
  });

  useLayoutEffect(() => {
    document.documentElement.dataset['density'] = dense ? 'compact' : 'comfortable';
  }, [dense]);

  const toggle = () => {
    const next = !(localStorage.getItem('density') === 'compact');
    localStorage.setItem('density', next ? 'compact' : 'comfortable');
    document.documentElement.dataset['density'] = next ? 'compact' : 'comfortable';
    setDense(next);
  };

  return { dense, toggle };
}
