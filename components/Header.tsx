import React, { useState, useRef, useEffect } from 'react';
import { PlusCircleIcon, ChevronDownIcon, PlusIcon, ArrowRightOnRectangleIcon } from './icons/Icons';
import { Account } from '../types';

interface HeaderProps {
  accounts: Account[];
  activeAccount: Account | null;
  onSetAccount: (id: string) => void;
  onAddAccount: () => void;
  onAddTrade: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ accounts, activeAccount, onSetAccount, onAddAccount, onAddTrade, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          FX <span className="text-blue-400">SYNDICATE</span> Trade Journal
        </h1>
        <div className="flex items-center gap-4">
          {accounts.length > 0 && activeAccount && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <span>{activeAccount.name}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-700 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    {accounts.map(account => (
                      <a
                        key={account.id}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onSetAccount(account.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`block px-4 py-2 text-sm ${activeAccount.id === account.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                      >
                        {account.name}
                      </a>
                    ))}
                     <div className="border-t border-gray-600 my-1"></div>
                     <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onAddAccount();
                            setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Another Account
                      </a>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={onAddTrade}
            disabled={!activeAccount}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Log New Trade</span>
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200"
            title="Logout"
            aria-label="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
