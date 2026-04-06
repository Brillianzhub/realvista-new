import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initPurchases,
  isProUser,
} from '@/utils/subscriptions/proSubscription';

type ProContextType = {
  isPro: boolean;
  refreshProStatus: () => Promise<void>;
};

const ProContext = createContext<ProContextType | undefined>(undefined);

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshProStatus = async () => {
    try {
      const result = await isProUser();
      setIsPro(result);
    } catch {
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPurchases(); // ✅ moved here
    refreshProStatus(); // ✅ safe after init
  }, []);

  return (
    <ProContext.Provider value={{ isPro, refreshProStatus }}>
      {!loading && children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error('usePro must be used within ProProvider');
  return ctx;
}
