import React, { useState } from 'react';
import ReactJson from 'react18-json-view';

export default function ResponsePanel({ response }) {
    const [tab, setTab] = useState('Pretty');

    if (!response) {
        return <div className="p-3 text-gray-400">No response yet.</div>;
    }

    const copyToClipboard = () => {
        const text =
            tab === 'Headers'
                ? JSON.stringify(response.headers, null, 2)
                : JSON.stringify(response.data, null, 2);
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-sm">
            <div className="flex justify-between p-2 text-gray-400 border-b border-gray-700">
                <div className="flex gap-4">
                    <span>Status: <strong className="text-green-400">{response.status}</strong></span>
                    <span>Time: {response.timestamp || 'N/A'}</span>
                    <span>Size: {JSON.stringify(response.data).length} bytes</span>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="text-xs text-blue-400 hover:text-blue-200"
                >
                    📋 Copy
                </button>
            </div>

            <div className="flex border-b border-gray-700 px-2">
                {['Pretty', 'Raw', 'Headers'].map(t => (
                    <button
                        key={t}
                        className={`px-3 py-1 text-sm ${tab === t ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setTab(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>


            <div className="p-2 overflow-auto flex-1 text-white">
                {tab === 'Pretty' && (
                    <ReactJson
                        src={typeof response.data === 'string' ? JSON.parse(response.data) : response.data}
                        collapsed={1}
                        enableClipboard={false}
                        displayDataTypes={false}
                        theme="paraiso"
                    />
                )}

                {tab === 'Raw' && (
                    <pre className="text-white bg-gray-800 p-3 rounded overflow-x-auto">
            {typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data, null, 2)}
          </pre>
                )}

                {tab === 'Headers' && (
                    <pre className="text-white bg-gray-800 p-3 rounded overflow-x-auto">
            {JSON.stringify(response.headers || {}, null, 2)}
          </pre>
                )}
            </div>
        </div>
    );
}
