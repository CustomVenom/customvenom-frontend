'use client';
import { useEffect, useState } from 'react';

export function useDensity() {
  const [dense, setDense] = useState<boolean>(false);

  useEffect(() => {
    const s = localStorage.getItem('density') === 'compact';
    setDense(s);
    document.documentElement.dataset['density'] = s ? 'compact' : 'comfortable';
  }, []);

  const toggle = () => {
    const next = !(localStorage.getItem('density') === 'compact');
    localStorage.setItem('density', next ? 'compact' : 'comfortable');
    document.documentElement.dataset['density'] = next ? 'compact' : 'comfortable';
    setDense(next);
  };

  return { dense, toggle };
}
