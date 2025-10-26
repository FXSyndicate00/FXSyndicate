import React, { useState } from 'react';
import { Trade, Position, TradeOutcome, AnalysisResult } from '../types';
import { analyzeTrade } from '../services/geminiService';
import { XMarkIcon } from './icons/Icons';
import Markdown from 'react-markdown';


interface TradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade;
  accountName: string;
}

const DetailItem: React.FC<{ label: string, value: string | number, className?: string }> = ({ label, value, className }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-lg font-semibold ${className}`}>{value}</p>
    </div>
);

const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ isOpen, onClose, trade, accountName }) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
  
    const handleGetAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAnalysis(null);
        try {
            const result = await analyzeTrade(trade);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to get analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
  if (!isOpen) return null;

  const isWin = trade.pnl > 0;
  const pnlColor = isWin ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400';
  const positionColor = trade.position === Position.LONG ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  const outcomeColor = trade.outcome === TradeOutcome.WIN ? 'text-green-400' : 'text-red-400';
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-white">
            Trade Details: <span className="text-blue-400">{trade.pair}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <DetailItem label="P/L" value={currencyFormatter.format(trade.pnl)} className={pnlColor} />
                <DetailItem label="Outcome" value={trade.outcome} className={outcomeColor} />
                <DetailItem label="Position" value={trade.position} className={positionColor.replace('bg-', 'text-').replace('/20', '')} />
                <DetailItem label="Date" value={new Date(trade.tradeDate).toLocaleDateString()} />
                <DetailItem label="Account" value={accountName} />
                <DetailItem label="Strategy" value={trade.strategy} />
                <DetailItem label="Lot Size" value={trade.lotSize} />
                <DetailItem label="Entry Price" value={trade.entryPrice} />
                <DetailItem label="Stop Loss" value={trade.stopLoss} />
                <DetailItem label="Take Profit" value={trade.takeProfit} />
            </div>
            
            {trade.notes && (
                <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-300 mb-2">Notes / Psychology</h4>
                    <p className="bg-gray-700/50 p-4 rounded-lg text-gray-300 whitespace-pre-wrap">{trade.notes}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trade.screenshot && (
                    <div>
                        <h4 className="text-md font-semibold text-gray-300 mb-2">Chart Screenshot</h4>
                        <img src={trade.screenshot} alt="Trade chart" className="rounded-lg w-full object-cover" />
                    </div>
                )}
                
                <div className={!trade.screenshot ? 'col-span-2' : ''}>
                    <div className="flex justify-between items-center mb-2">
                         <h4 className="text-md font-semibold text-gray-300">AI Trade Analysis</h4>
                         <button onClick={handleGetAnalysis} disabled={isLoading} className="bg-blue-600 text-sm hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200 disabled:bg-blue-400">
                             {isLoading ? 'Analyzing...' : 'Analyze Trade'}
                         </button>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg min-h-[150px]">
                        {isLoading && <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div></div>}
                        {error && <p className="text-red-400">{error}</p>}
                        {analysis && (
                            <div>
                                <div className="prose prose-sm prose-invert max-w-none prose-p:text-gray-300">
                                    <Markdown>{analysis.text}</Markdown>
                                </div>
                                {analysis.sources && analysis.sources.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-600">
                                        <h5 className="text-xs font-semibold text-gray-400 uppercase">Sources</h5>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            {analysis.sources.map((source, index) => (
                                                <li key={index} className="text-sm">
                                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block">
                                                        {source.title || source.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        {!analysis && !isLoading && !error && <p className="text-gray-400 text-center pt-8">Click "Analyze Trade" for AI-powered feedback.</p>}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailModal;