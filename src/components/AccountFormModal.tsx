
import React, { useState } from 'react';
import { Account, AccountType } from '../types';
import { XMarkIcon } from './icons/Icons';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'>) => void;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: 10000,
    accountType: AccountType.LIVE,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'initialBalance' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.name && formData.initialBalance > 0) {
        onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Create New Account</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                 <p className="text-gray-400 mt-2">Set up a new account to start tracking your trades.</p>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Account Name</label>
                    <input 
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. FTMO Challenge"
                        required
                        className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-300">Initial Balance ($)</label>
                    <input 
                        type="number"
                        id="initialBalance"
                        name="initialBalance"
                        value={formData.initialBalance}
                        onChange={handleChange}
                        required
                        min="1"
                        step="any"
                        className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-300">Account Type</label>
                    <select 
                        id="accountType"
                        name="accountType" 
                        value={formData.accountType} 
                        onChange={handleChange} 
                        required 
                        className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={AccountType.LIVE}>Live</option>
                        <option value={AccountType.FUNDED}>Funded</option>
                    </select>
                </div>
            </div>
            <div className="p-6 bg-gray-700/50 rounded-b-lg flex justify-end">
                <button type="button" onClick={onClose} className="mr-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save Account</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormModal;