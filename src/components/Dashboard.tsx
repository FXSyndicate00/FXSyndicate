
import React, { useMemo } from 'react';
import { Trade, Account } from '../types';
import StatCard from './StatCard';
import ProgressChart from './ProgressChart';
import { ArrowTrendingUpIcon, ChartPieIcon, BanknotesIcon, ScaleIcon } from './icons/Icons';

interface DashboardProps {
  trades: Trade[];
  activeAccount: Account;
  currentBalance: number;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, activeAccount, currentBalance }) => {
  const initialBalance = activeAccount.initialBalance;

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }), []);

  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
    
    if (totalTrades === 0) {
      return { totalPnl, winRate: 0, accountGrowth: 0 };
    }
    const winningTrades = trades.filter(t => t.pnl > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    const accountGrowth = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0;
    
    return { totalPnl, winRate, accountGrowth };
  }, [trades, initialBalance]);

  return (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4">
            Dashboard: <span className="text-blue-400">{activeAccount.name}</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
                title="Current Balance"
                value={currencyFormatter.format(currentBalance)}
                icon={<ScaleIcon />}
            />
            <StatCard 
                title="Total P/L"
                value={currencyFormatter.format(stats.totalPnl)}
                isPositive={stats.totalPnl >= 0}
                icon={<BanknotesIcon />}
            />
            <StatCard 
                title="Account Growth"
                value={`${stats.accountGrowth.toFixed(2)}%`}
                 isPositive={stats.accountGrowth >= 0}
                icon={<ArrowTrendingUpIcon />}
            />
            <StatCard 
                title="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
                icon={<ChartPieIcon />}
            />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Account Growth</h3>
            <ProgressChart trades={trades} initialBalance={initialBalance} />
        </div>
    </div>
  );
};

export default Dashboard;