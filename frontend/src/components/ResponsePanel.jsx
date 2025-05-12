import React, { useState, useEffect } from 'react';
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export default function ResponsePanel({ response }) {
    const [tab, setTab] = useState('Pretty');
    const [showViewer, setShowViewer] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setShowViewer(false);
        };

        if (showViewer) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showViewer]);

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

    const parsedData =
        typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

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

            {/* Tabs + Viewer Button */}
            <div className="flex items-center justify-between border-b border-gray-700 px-2 shrink-0">
                <div className="flex">
                    {['Pretty', 'Raw', 'Headers'].map(t => (
                        <button
                            key={t}
                            className={`px-3 py-1 text-sm ${
                                tab === t ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'
                            }`}
                            onClick={() => setTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {tab === 'Pretty' && (
                    <button
                        onClick={() => setShowViewer(true)}
                        className="text-sm text-purple-400 hover:text-purple-300"
                    >
                        Open in JSON Viewer
                    </button>
                )}
            </div>

            {/* Scrollable Response Panel */}
            <div className="flex-1 overflow-auto bg-gray-900">
                <div className="p-2 w-full h-full">
                    {tab === 'Pretty' && (
                        <div className="bg-gray-800 p-2 rounded overflow-auto max-h-[70vh] max-w-full">
                            <div className="min-w-[800px] whitespace-pre-wrap break-all">
                                <JsonView
                                    data={parsedData}
                                    style={darkStyles}
                                    defaultInspectDepth={1}
                                    displayObjectSize={false}
                                    enableClipboard={false}
                                />
                            </div>
                        </div>
                    )}

                    {tab === 'Raw' && (
                        <div className="bg-gray-800 p-3 rounded overflow-auto max-h-[70vh] max-w-full">
                            <pre className="text-white whitespace-pre-wrap break-all min-w-[800px]">
                                {typeof response.data === 'string'
                                    ? response.data
                                    : JSON.stringify(response.data, null, 2)}
                            </pre>
                        </div>
                    )}

                    {tab === 'Headers' && (
                        <div className="bg-gray-800 p-3 rounded overflow-auto max-h-[70vh] max-w-full">
                            <pre className="text-white whitespace-pre-wrap break-all min-w-[800px]">
                                {JSON.stringify(response.headers || {}, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen JSON Viewer Modal */}
            {showViewer && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowViewer(false)}
                >
                    <div
                        className="bg-gray-900 p-4 rounded-lg shadow-lg w-[85%] h-[85%] overflow-auto relative"
                        onClick={(e) => e.stopPropagation()} // prevent modal close on inner click
                    >
                        <JsonView
                            data={parsedData}
                            style={darkStyles}
                            defaultInspectDepth={2}
                            displayObjectSize={false}
                            enableClipboard={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
