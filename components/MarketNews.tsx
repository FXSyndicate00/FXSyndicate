import React, { useState, useEffect } from 'react';
import { fetchEconomicCalendar } from '../services/geminiService';
import { EconomicEvent } from '../types';
import { CalendarDaysIcon } from './icons/Icons';

const EventSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="flex items-center gap-3">
             <div className="h-4 bg-gray-600 rounded w-12"></div>
             <div className="h-3 w-3 bg-gray-700 rounded-full"></div>
             <div className="h-4 bg-gray-600 rounded w-8"></div>
             <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        </div>
        <div className="pl-[92px] mt-2 grid grid-cols-3 gap-2">
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const ImpactIndicator: React.FC<{ impact: 'High' | 'Medium' | 'Low' }> = ({ impact }) => {
    const color = {
        High: 'bg-red-500',
        Medium: 'bg-orange-400',
        Low: 'bg-yellow-400',
    }[impact];
    return <div className={`w-3 h-3 rounded-full ${color}`} title={`${impact} Impact`}></div>;
};


const EconomicCalendar: React.FC = () => {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const getCalendar = async () => {
            try {
                setIsLoading(true);
                const fetchedEvents = await fetchEconomicCalendar();
                setEvents(fetchedEvents);
            } catch (err) {
                setError('Could not load economic calendar. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        getCalendar();
    }, []);

    const renderValue = (value: string | null) => (
        <span className={!value ? 'text-gray-500' : 'text-gray-200'}>
            {value || '–'}
        </span>
    );

    return (
        <div className="h-full flex flex-col">
             <div className="p-6 border-b border-gray-700 flex items-center gap-3">
                 <CalendarDaysIcon className="w-6 h-6 text-blue-400"/>
                <h3 className="text-xl font-bold text-white">Economic Calendar</h3>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto flex-grow text-sm">
                {isLoading && (
                    <>
                        <EventSkeleton />
                        <EventSkeleton />
                        <EventSkeleton />
                        <EventSkeleton />
                        <EventSkeleton />
                    </>
                )}
                {error && <p className="text-red-400 text-center py-10">{error}</p>}
                {!isLoading && !error && events.length > 0 && events.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-start gap-3">
                            <span className="font-bold w-12 text-gray-300">{item.time}</span>
                            <div className="pt-1.5"><ImpactIndicator impact={item.impact} /></div>
                            <span className="font-semibold text-gray-400 w-8">{item.currency}</span>
                            <p className="flex-1 text-gray-200 leading-tight">{item.event}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 pl-[92px] text-xs">
                            <div>
                                <span className="text-gray-500">Actual: </span>
                                {renderValue(item.actual)}
                            </div>
                            <div>
                                <span className="text-gray-500">Forecast: </span>
                                {renderValue(item.forecast)}
                            </div>
                            <div>
                                <span className="text-gray-500">Previous: </span>
                                {renderValue(item.previous)}
                            </div>
                        </div>
                    </div>
                ))}
                {!isLoading && !error && events.length === 0 && (
                     <p className="text-gray-400 text-center py-10">No high/medium impact events for today.</p>
                )}
            </div>
        </div>
    );
};

export default EconomicCalendar;
