
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isPositive }) => {
  const valueColor = isPositive === undefined 
    ? 'text-white' 
    : isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg flex items-center space-x-4">
      <div className="bg-gray-700 p-3 rounded-full">
        <div className={`w-6 h-6 ${isPositive === undefined ? 'text-blue-400' : isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;