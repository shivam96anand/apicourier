import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FolderPanel from './components/FolderPanel';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';

export default function App() {
    const [activeTab, setActiveTab] = useState('APIs');
    const [theme, setTheme] = useState('dark');
    const [folders, setFolders] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [latestResponse, setLatestResponse] = useState(null);
    const [foldersLoaded, setFoldersLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const saved = await window.electronAPI.getFolders();
                if (Array.isArray(saved)) {
                    setFolders(saved);
                } else {
                    setFolders([]);
                }
            } catch (err) {
                console.warn('Failed to load folders:', err);
                setFolders([]);
            } finally {
                setFoldersLoaded(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (!foldersLoaded) return;

        try {
            window.electronAPI.saveFolders(folders);
        } catch (err) {
            console.error('Failed to persist folders:', err);
        }
    }, [folders, foldersLoaded]);

    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const handleSelectRequest = (req) => {
        const folder = folders.find(f => f.id === req.folderId);
        const fullReq = folder?.requests.find(r => r.id === req.id);
        setSelectedRequest(fullReq || null);
        setLatestResponse(fullReq?.lastResponse || null);
    };

    const handleSendResponse = (response) => {
        setLatestResponse(response);
        const updated = folders.map(folder =>
            folder.id === selectedRequest.folderId
                ? {
                    ...folder,
                    requests: folder.requests.map(r =>
                        r.id === selectedRequest.id ? { ...r, lastResponse: response } : r
                    )
                }
                : folder
        );
        setFolders(updated);
    };

    const handleUpdateRequest = (updatedReq) => {
        const updated = folders.map(folder =>
            folder.id === updatedReq.folderId
                ? {
                    ...folder,
                    requests: folder.requests.map(r =>
                        r.id === updatedReq.id ? updatedReq : r
                    )
                }
                : folder
        );
        setFolders(updated);
    };

    return (
        <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
            {activeTab === 'APIs' ? (
                <>
                    <FolderPanel
                        folders={folders}
                        setFolders={setFolders}
                        onSelectRequest={handleSelectRequest}
                    />
                    <div className="flex flex-col flex-1">
                        <RequestPanel
                            theme={theme}
                            onToggleTheme={toggleTheme}
                            selectedRequest={selectedRequest}
                            onSendResponse={handleSendResponse}
                            onUpdateRequest={handleUpdateRequest}
                        />
                        <div className="border-t border-gray-700 flex-1">
                            <ResponsePanel response={latestResponse} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <h2 className="text-2xl">{activeTab} – Coming Soon</h2>
                </div>
            )}
        </div>
    );
}
