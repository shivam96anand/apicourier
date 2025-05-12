import React from 'react';

const tabs = ['APIs', 'Json Compare', 'Load Testing', 'Testing with AI', 'History'];

export default function Sidebar({ activeTab, onSelectTab }) {
    return (
        <div className="w-48 bg-gray-800 text-gray-300 flex flex-col border-r border-gray-700">
            {tabs.map(tab => (
                <button
                    key={tab}
                    className={`py-3 px-4 text-sm font-semibold text-left ${activeTab === tab ? 'bg-gray-700 text-white' : 'hover:bg-gray-700'}`}
                    onClick={() => onSelectTab(tab)}
                    title={tab}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}