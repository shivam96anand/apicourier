import React, { useState } from 'react';
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

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
        <div className="flex flex-col h-full bg-gray-900 text-sm overflow-hidden">
            {/* Status Bar */}
            <div className="flex justify-between p-2 text-gray-400 border-b border-gray-700 shrink-0">
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

            {/* Tabs */}
            <div className="flex border-b border-gray-700 px-2 shrink-0">
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

            {/* Scrollable panel */}
            <div className="flex-1 overflow-auto bg-gray-900">
                <div className="p-2 w-full h-full">
                    {tab === 'Pretty' && (
                        <div className="bg-gray-800 p-2 rounded overflow-auto max-h-[70vh] max-w-full">
                            <div className="min-w-[800px] whitespace-pre-wrap break-all">
                                <JsonView
                                    data={typeof response.data === 'string' ? JSON.parse(response.data) : response.data}
                                    style={darkStyles}
                                    defaultInspectDepth={1}
                                    displayObjectSize={false}
                                    enableClipboard={false}
                                />
                            </div>
                        </div>
                    )}

                    {tab === 'Raw' && (
                        <pre className="text-white bg-gray-800 p-3 rounded overflow-auto whitespace-pre-wrap break-all">
                            {typeof response.data === 'string'
                                ? response.data
                                : JSON.stringify(response.data, null, 2)}
                        </pre>
                    )}

                    {tab === 'Headers' && (
                        <pre className="text-white bg-gray-800 p-3 rounded overflow-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(response.headers || {}, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
