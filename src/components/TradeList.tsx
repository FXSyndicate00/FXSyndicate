
import React from 'react';
import { Trade, TradeOutcome } from '../types';
import { PencilIcon, TrashIcon } from './icons/Icons';

interface TradeListProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
}

const TradeItem: React.FC<{
  trade: Trade;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ trade, onSelect, onEdit, onDelete }) => {
    const isWin = trade.pnl > 0;
    const pnlColor = isWin ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400';
    const outcomeColor = trade.outcome === TradeOutcome.WIN ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <tr className="bg-gray-800 hover:bg-gray-700/50 transition-colors duration-150">
            <td className="p-3 cursor-pointer" onClick={onSelect}>{new Date(trade.tradeDate).toLocaleDateString()}</td>
            <td className="p-3 cursor-pointer font-semibold" onClick={onSelect}>{trade.pair}</td>
            <td className="p-3 cursor-pointer" onClick={onSelect}>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${outcomeColor}`}>{trade.outcome.toUpperCase()}</span>
            </td>
            <td className={`p-3 cursor-pointer font-semibold ${pnlColor}`} onClick={onSelect}>
                {currencyFormatter.format(trade.pnl)}
            </td>
            <td className="p-3 cursor-pointer hidden md:table-cell" onClick={onSelect}>{trade.strategy}</td>
            <td className="p-3 text-right">
                <button onClick={onEdit} className="text-blue-400 hover:text-blue-300 p-2"><PencilIcon className="w-5 h-5"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-400 hover:text-red-300 p-2"><TrashIcon className="w-5 h-5"/></button>
            </td>
        </tr>
    );
};


const TradeList: React.FC<TradeListProps> = ({ trades, onSelectTrade, onEditTrade, onDeleteTrade }) => {
  if (trades.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-12 text-center shadow-lg">
        <p className="text-gray-400">You haven't logged any trades yet.</p>
        <p className="text-gray-500 text-sm mt-2">Click "Log New Trade" to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-700/50 text-xs uppercase text-gray-400">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Pair</th>
                        <th className="p-3">Outcome</th>
                        <th className="p-3">P/L</th>
                        <th className="p-3 hidden md:table-cell">Strategy</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map(trade => (
                        <TradeItem 
                            key={trade.id} 
                            trade={trade} 
                            onSelect={() => onSelectTrade(trade)} 
                            onEdit={() => onEditTrade(trade)}
                            onDelete={() => onDeleteTrade(trade.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default TradeList;