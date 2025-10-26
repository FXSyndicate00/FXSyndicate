import React, { useState, useEffect, useMemo } from 'react';
import { Trade, Position, TradeOutcome } from '../types';
import { XMarkIcon, ArrowPathIcon } from './icons/Icons';
import { fetchCurrentPrice } from '../services/geminiService';

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade | Omit<Trade, 'id' | 'accountId'>) => void;
  existingTrade?: Trade | null;
}

const INSTRUMENTS = {
  "Forex Majors": ["EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD"],
  "Forex Minors": ["EUR/GBP", "EUR/AUD", "GBP/JPY", "CHF/JPY", "NZD/JPY", "GBP/CAD", "EUR/JPY", "AUD/JPY", "CAD/JPY"],
  "Indices": ["US30", "SPX500", "NAS100", "UK100", "GER30", "FRA40", "JPN225", "AUS200"],
  "Commodities": ["XAU/USD (Gold)", "XAG/USD (Silver)", "USOIL (WTI)", "UKOIL (Brent)"],
  "Popular Stocks": ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "JPM"],
  "Crypto": ["BTC/USD", "ETH/USD", "XRP/USD", "LTC/USD", "BCH/USD", "ADA/USD", "DOGE/USD", "SOL/USD"],
};


const TradeFormModal: React.FC<TradeFormModalProps> = ({ isOpen, onClose, onSave, existingTrade }) => {
  const [formData, setFormData] = useState({
    pair: '',
    position: Position.LONG,
    lotSize: 0.01,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
    outcome: '' as TradeOutcome | '',
    tradeDate: new Date().toISOString().slice(0, 10),
    strategy: '',
    notes: '',
    screenshot: '',
  });

  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [potentialLoss, setPotentialLoss] = useState<number>(0);
  const [calculatedPnl, setCalculatedPnl] = useState<number>(0);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }), []);

  const resetForm = () => {
    setFormData({
        pair: '',
        position: Position.LONG,
        lotSize: 0.01,
        entryPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        outcome: '',
        tradeDate: new Date().toISOString().slice(0, 10),
        strategy: '',
        notes: '',
        screenshot: '',
    });
  };

  useEffect(() => {
    if (existingTrade) {
      setFormData({
        pair: existingTrade.pair,
        position: existingTrade.position,
        lotSize: existingTrade.lotSize,
        entryPrice: existingTrade.entryPrice,
        stopLoss: existingTrade.stopLoss,
        takeProfit: existingTrade.takeProfit,
        outcome: existingTrade.outcome,
        tradeDate: existingTrade.tradeDate,
        strategy: existingTrade.strategy,
        notes: existingTrade.notes,
        screenshot: existingTrade.screenshot || '',
      });
    } else {
      resetForm();
    }
  }, [existingTrade, isOpen]);

  const calculatePnl = (entry: number, exit: number, position: Position, lotSize: number, pair: string): number => {
    if (entry <= 0 || exit <= 0 || lotSize <= 0 || !pair) return 0;

    const priceDifference = position === Position.LONG ? exit - entry : entry - exit;
    const cleanedPair = pair.split(' ')[0];

    // Specific handling for Gold (XAU/USD)
    if (cleanedPair.toUpperCase() === 'XAU/USD') {
        const contractSize = 100; // 100 troy ounces per standard lot
        return priceDifference * lotSize * contractSize;
    }
    
    // Handle Stocks, most Commodities & Indices (e.g., AAPL, USOIL, US30)
    if (!cleanedPair.includes('/')) {
        return priceDifference * lotSize;
    }
    
    // Handle Forex, Crypto, and other pairs
    const [base, quote] = cleanedPair.split('/');
    const contractSize = 100000; // Standard lot size for forex

    if (!quote) return priceDifference * lotSize;

    let pnl = 0;
    // Direct USD quote (e.g., EUR/USD, BTC/USD)
    if (quote.toUpperCase() === 'USD') {
        pnl = priceDifference * lotSize * contractSize;
    } 
    // USD is the base currency (e.g., USD/JPY)
    else if (base.toUpperCase() === 'USD') {
        const pnlInQuote = priceDifference * lotSize * contractSize;
        pnl = pnlInQuote / exit; // Convert back to USD
    } 
    // Cross pairs (e.g., EUR/JPY) - approximation
    else {
        pnl = priceDifference * lotSize * contractSize;
    }
    return pnl;
  };

  useEffect(() => {
    const { entryPrice, takeProfit, position, lotSize, pair } = formData;
    setPotentialProfit(calculatePnl(entryPrice, takeProfit, position, lotSize, pair));
  }, [formData.entryPrice, formData.takeProfit, formData.position, formData.lotSize, formData.pair]);

  useEffect(() => {
    const { entryPrice, stopLoss, position, lotSize, pair } = formData;
    setPotentialLoss(calculatePnl(entryPrice, stopLoss, position, lotSize, pair));
  }, [formData.entryPrice, formData.stopLoss, formData.position, formData.lotSize, formData.pair]);

  useEffect(() => {
    if (formData.outcome === TradeOutcome.WIN) {
        setCalculatedPnl(potentialProfit);
    } else if (formData.outcome === TradeOutcome.LOSS) {
        setCalculatedPnl(potentialLoss);
    } else {
        setCalculatedPnl(0);
    }
  }, [formData.outcome, potentialProfit, potentialLoss]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.endsWith('Price') || name.endsWith('Size') || name.endsWith('Loss') || name.endsWith('Profit') ? parseFloat(value) : value }));
  };
  
  const handleFetchPrice = async () => {
    if (!formData.pair) {
        alert("Please select an instrument first.");
        return;
    }
    setIsFetchingPrice(true);
    try {
        const price = await fetchCurrentPrice(formData.pair);
        setFormData(prev => ({ ...prev, entryPrice: price }));
    } catch (error) {
        console.error("Failed to fetch price:", error);
        alert("Could not fetch the current price. Please enter it manually.");
    } finally {
        setIsFetchingPrice(false);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.outcome) {
        alert("Please select a trade outcome.");
        return;
    }
    
    const exitPrice = formData.outcome === TradeOutcome.WIN ? formData.takeProfit : formData.stopLoss;
    
    const tradeData = { ...formData, pnl: calculatedPnl, exitPrice, outcome: formData.outcome as TradeOutcome };
    
    if (existingTrade) {
      onSave({ ...existingTrade, ...tradeData });
    } else {
      onSave(tradeData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-gray-800 z-10 border-b border-gray-700">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{existingTrade ? 'Edit Trade' : 'Log New Trade'}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Instrument</label>
              <input 
                type="text" 
                name="pair" 
                value={formData.pair} 
                onChange={handleChange} 
                placeholder="e.g. EUR/USD" 
                required 
                list="instrument-list"
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <datalist id="instrument-list">
                {Object.entries(INSTRUMENTS).map(([group, pairs]) => (
                    <optgroup key={group} label={group}>
                        {pairs.map(pair => <option key={pair} value={pair} />)}
                    </optgroup>
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Position</label>
              <select name="position" value={formData.position} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                <option value={Position.LONG}>Long</option>
                <option value={Position.SHORT}>Short</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Lot Size / Quantity</label>
              <input type="number" name="lotSize" value={formData.lotSize} onChange={handleChange} step="0.01" min="0.01" required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Entry Price</label>
               <div className="relative mt-1">
                 <input type="number" name="entryPrice" value={formData.entryPrice} onChange={handleChange} step="any" required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 pr-10" />
                 <button type="button" onClick={handleFetchPrice} disabled={isFetchingPrice || !formData.pair} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed">
                     {isFetchingPrice ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div> : <ArrowPathIcon className="w-5 h-5"/>}
                 </button>
               </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Stop Loss</label>
              <input type="number" name="stopLoss" value={formData.stopLoss} onChange={handleChange} step="any" required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Take Profit</label>
              <input type="number" name="takeProfit" value={formData.takeProfit} onChange={handleChange} step="any" required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <div>
                    <label className="block text-xs font-medium text-gray-400">Potential Profit (TP)</label>
                     <div className="mt-1 font-semibold text-green-400">{currencyFormatter.format(potentialProfit)}</div>
                </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400">Potential Loss (SL)</label>
                    <div className="mt-1 font-semibold text-red-400">{currencyFormatter.format(potentialLoss)}</div>
                </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Trade Outcome</label>
              <select name="outcome" value={formData.outcome} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Select Outcome...</option>
                <option value={TradeOutcome.WIN}>Win (Hit TP)</option>
                <option value={TradeOutcome.LOSS}>Loss (Hit SL)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Final P/L (USD)</label>
              <div className={`mt-1 w-full bg-gray-900 border border-gray-700 rounded-md p-2 font-semibold ${calculatedPnl > 0 ? 'text-green-400' : calculatedPnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {currencyFormatter.format(calculatedPnl)}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Trade Date</label>
              <input type="date" name="tradeDate" value={formData.tradeDate} onChange={handleChange} required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Strategy</label>
              <input type="text" name="strategy" value={formData.strategy} onChange={handleChange} placeholder="e.g. Break and Retest" required className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Notes / Psychology</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="How did you feel? Did you follow your plan?" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Chart Screenshot</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                {formData.screenshot && <img src={formData.screenshot} alt="Screenshot preview" className="mt-2 rounded-lg max-h-40" />}
             </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="mr-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save Trade</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeFormModal;