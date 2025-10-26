
import React, { useEffect, useRef } from 'react';
import { Trade } from '../types';
import Chart from 'chart.js/auto';

interface ProgressChartProps {
    trades: Trade[];
    initialBalance: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ trades, initialBalance }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (initialBalance === 0 && trades.length === 0) return;

        const sortedTrades = [...trades]
            .filter(trade => trade.tradeDate)
            .sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime());

        const labels = ['Start', ...sortedTrades.map((_, i) => `Trade ${i + 1}`)];
        const dataPoints = [initialBalance];
        let runningBalance = initialBalance;

        sortedTrades.forEach(trade => {
            runningBalance += trade.pnl;
            dataPoints.push(runningBalance);
        });
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Account Balance',
                    data: dataPoints,
                    borderColor: '#60a5fa', // blue-400
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    tension: 0.1,
                    fill: true,
                    pointBackgroundColor: '#60a5fa',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#9ca3af' // gray-400
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#9ca3af', // gray-400
                            callback: function(value: any) {
                                if (typeof value === 'number') {
                                    return '$' + value.toLocaleString();
                                }
                                return '$' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };

    }, [trades, initialBalance]);
    
    if (initialBalance === 0 && trades.length === 0) {
        return (
             <div className="text-gray-400 text-center py-20 h-full flex items-center justify-center">
                <p>Set your initial balance and log some trades to see your progress chart.</p>
            </div>
        )
    }

    return (
        <div className="relative h-64 md:h-80">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default ProgressChart;