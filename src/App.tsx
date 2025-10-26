
import React, { useState, useMemo, useEffect } from 'react';
import { Trade, Account } from './types';
import { useTrades } from './hooks/useTrades';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import TradeFormModal from './components/TradeFormModal';
import TradeDetailModal from './components/TradeDetailModal';
import AccountFormModal from './components/AccountFormModal';
import Login from './components/Login';
import MarketNews from './components/MarketNews';

const App: React.FC = () => {
  const {
    accounts,
    activeAccount,
    trades,
    addTrade,
    updateTrade,
    deleteTrade,
    currentBalance,
    addAccount,
    setActiveAccount
  } = useTrades();

  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accounts.length === 0) {
      setIsAccountFormOpen(true);
    }
  }, [accounts, isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleOpenTradeForm = (trade: Trade | null = null) => {
    setEditingTrade(trade);
    setIsTradeFormOpen(true);
  };

  const handleCloseTradeForm = () => {
    setIsTradeFormOpen(false);
    setEditingTrade(null);
  };

  const handleSelectTrade = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleCloseDetailModal = () => {
    setSelectedTrade(null);
  };

  const handleSaveAccount = (accountData: Omit<Account, 'id'>) => {
    addAccount(accountData);
    setIsAccountFormOpen(false);
  };

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
  }, [trades]);

  const accountForSelectedTrade = selectedTrade ? accounts.find(a => a.id === selectedTrade.accountId) : null;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header
        accounts={accounts}
        activeAccount={activeAccount}
        onSetAccount={setActiveAccount}
        onAddAccount={() => setIsAccountFormOpen(true)}
        onAddTrade={() => handleOpenTradeForm()}
        onLogout={handleLogout}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {activeAccount ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Dashboard 
                    trades={trades} 
                    activeAccount={activeAccount} 
                    currentBalance={currentBalance} 
                />
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Trade History</h2>
                    <TradeList
                        trades={sortedTrades}
                        onSelectTrade={handleSelectTrade}
                        onEditTrade={(trade) => handleOpenTradeForm(trade)}
                        onDeleteTrade={deleteTrade}
                    />
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg row-start-1 lg:row-start-auto">
                <MarketNews />
            </div>
          </div>
        ) : (
            <div className="text-center py-20 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-white">No Trading Account Found</h2>
                <p className="text-gray-400 mt-2">Please create an account to start journaling your trades.</p>
                <button 
                    onClick={() => setIsAccountFormOpen(true)}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Create Your First Account
                </button>
            </div>
        )}
      </main>

      {isAccountFormOpen && (
        <AccountFormModal
          isOpen={isAccountFormOpen}
          onClose={() => setIsAccountFormOpen(false)}
          onSave={handleSaveAccount}
        />
      )}

      {isTradeFormOpen && (
        <TradeFormModal
          isOpen={isTradeFormOpen}
          onClose={handleCloseTradeForm}
          onSave={editingTrade ? updateTrade : addTrade}
          existingTrade={editingTrade}
        />
      )}

      {selectedTrade && accountForSelectedTrade && (
        <TradeDetailModal
          isOpen={!!selectedTrade}
          onClose={handleCloseDetailModal}
          trade={selectedTrade}
          accountName={accountForSelectedTrade.name}
        />
      )}
    </div>
  );
};

export default App;