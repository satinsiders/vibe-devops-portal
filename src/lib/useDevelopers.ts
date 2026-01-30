import { useState, useEffect } from 'react';
import * as api from './api';

export interface Developer {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'idle' | 'blocked';
}

let developersCache: Developer[] | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useDevelopers() {
  const [developers, setDevelopers] = useState<Developer[]>(developersCache || []);
  const [loading, setLoading] = useState(!developersCache);

  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        const devs = await api.getDevelopers();
        developersCache = devs;
        setDevelopers(devs);
        setLoading(false);
        notifyListeners();
      } catch (error) {
        console.error('Failed to load developers:', error);
        setLoading(false);
      }
    };

    if (!developersCache) {
      loadDevelopers();
    }

    // Subscribe to updates
    const handleUpdate = () => {
      if (developersCache) {
        setDevelopers(developersCache);
      }
    };

    listeners.add(handleUpdate);

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const refreshDevelopers = async () => {
    setLoading(true);
    try {
      const devs = await api.getDevelopers();
      developersCache = devs;
      setDevelopers(devs);
      notifyListeners();
    } catch (error) {
      console.error('Failed to refresh developers:', error);
    } finally {
      setLoading(false);
    }
  };

  return { developers, loading, refreshDevelopers };
}

// Utility function to invalidate cache (call after adding a developer)
export function invalidateDevelopersCache() {
  developersCache = null;
}
