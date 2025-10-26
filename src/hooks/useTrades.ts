
import { useState, useEffect, useMemo } from 'react';
import { Trade, Account } from '../types';

const ACCOUNTS_KEY = 'forexAccounts';
const TRADES_KEY = 'forexAllTrades';
const ACTIVE_ACCOUNT_ID_KEY = 'forexActiveAccountId';

export const useTrades = () => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error reading accounts from localStorage', error);
      return [];
    }
  });

  const [allTrades, setAllTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem(TRADES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error reading trades from localStorage', error);
      return [];
    }
  });

  const [activeAccountId, setActiveAccountId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);
      // Ensure the active account still exists
      if (saved) {
        const savedAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
        if (savedAccounts.some((acc: Account) => acc.id === saved)) {
          return saved;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading active account from localStorage', error);
      return null;
    }
  });

  // Set initial active account if one isn't set
  useEffect(() => {
    if (!activeAccountId && accounts.length > 0) {
      setActiveAccountId(accounts[0].id);
    }
  }, [accounts, activeAccountId]);

  // Save accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Error saving accounts to localStorage', error);
    }
  }, [accounts]);

  // Save trades to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TRADES_KEY, JSON.stringify(allTrades));
    } catch (error) {
      console.error('Error saving trades to localStorage', error);
    }
  }, [allTrades]);
  
  // Save active account ID to localStorage
  useEffect(() => {
    try {
      if(activeAccountId) {
        localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, activeAccountId);
      } else {
        localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
      }
    } catch (error) {
        console.error('Error saving active account ID to localStorage', error);
    }
  }, [activeAccountId]);

  const activeAccount = useMemo(() => {
    return accounts.find(acc => acc.id === activeAccountId) || null;
  }, [accounts, activeAccountId]);

  const trades = useMemo(() => {
    if (!activeAccountId) return [];
    return allTrades.filter(trade => trade.accountId === activeAccountId);
  }, [allTrades, activeAccountId]);

  const currentBalance = useMemo(() => {
    if (!activeAccount) return 0;
    const pnlForAccount = trades.reduce((acc, trade) => acc + trade.pnl, 0);
    return activeAccount.initialBalance + pnlForAccount;
  }, [activeAccount, trades]);

  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...accountData, id: new Date().toISOString() };
    setAccounts(prev => [...prev, newAccount]);
    if (!activeAccountId) {
      setActiveAccountId(newAccount.id);
    }
  };

  const addTrade = (tradeData: Omit<Trade, 'id' | 'accountId'>) => {
    if (!activeAccountId) {
        console.error("Cannot add trade: No active account.");
        return;
    }
    const newTrade: Trade = { ...tradeData, id: new Date().toISOString(), accountId: activeAccountId };
    setAllTrades(prev => [newTrade, ...prev]);
  };
  
  const updateTrade = (updatedTrade: Trade) => {
    setAllTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
  };

  const deleteTrade = (id: string) => {
    setAllTrades(prev => prev.filter(trade => trade.id !== id));
  };

  return { 
    accounts,
    activeAccount,
    trades,
    currentBalance,
    addAccount,
    setActiveAccount: setActiveAccountId,
    addTrade,
    updateTrade,
    deleteTrade,
  };
};
