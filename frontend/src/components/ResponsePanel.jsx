// Install the required library before using this component:
// npm install @andypf/json-viewer

import React, { useEffect, useRef, useState } from 'react';
import JsonViewer from '@andypf/json-viewer/dist/esm/react/JsonViewer';
import { Expand } from 'lucide-react';

export default function ResponsePanel({ response }) {
    const [tab, setTab] = useState('Pretty');
    const [showViewer, setShowViewer] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const searchInputRef = useRef();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (tab === 'Pretty') setShowSearch(true);
            } else if (e.key === 'Escape') {
                setShowViewer(false);
                setShowSearch(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [tab]);

    if (!response) {
        return <div className="p-3 text-gray-400">No response yet.</div>;
    }

    const parsedData =
        typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

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
            <div className="flex justify-between p-2 text-gray-400 border-b border-gray-700 shrink-0">
                <div className="flex gap-4">
                    <span>Status: <strong className="text-green-400">{response.status}</strong></span>
                    <span>Time: {response.timestamp || 'N/A'}</span>
                    <span>Size: {JSON.stringify(response.data).length} bytes</span>
                </div>
                <button onClick={copyToClipboard} className="text-xs text-blue-400 hover:text-blue-200">
                    📋 Copy
                </button>
            </div>

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
                        className="p-1 text-purple-400 hover:text-purple-300"
                        title="Open in Fullscreen"
                    >
                        <Expand size={18}/>
                    </button>
                )}
            </div>

            {showSearch && tab === 'Pretty' && (
                <div className="px-3 py-2 bg-gray-800 text-sm">
                    <input
                        ref={searchInputRef}
                        placeholder="Search..."
                        className="w-full p-1 rounded bg-gray-700 text-white"
                        onChange={(e) => {
                            const value = e.target.value;
                            document.querySelector('json-viewer')?.setAttribute('search', value);
                        }}
                        autoFocus
                    />
                </div>
            )}

            <div className="flex-1 overflow-auto bg-gray-900">
                <div className="p-2 w-full h-full">
                    {tab === 'Pretty' && (
                        <div className="bg-gray-800 p-2 rounded overflow-auto max-h-[70vh] max-w-full">
                            <JsonViewer
                                data={parsedData}
                                expanded={1}
                                theme="default-dark"
                                showToolbar={true}
                                className="min-w-[800px]"
                            />
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

            {showViewer && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowViewer(false)}
                >
                    <div
                        className="bg-gray-900 p-4 rounded-lg shadow-lg w-[85%] h-[85%] overflow-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <JsonViewer
                            data={parsedData}
                            expanded={false}
                            theme="default-dark"
                            showToolbar={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
