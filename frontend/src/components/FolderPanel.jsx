import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function FolderPanel({ folders, setFolders, onSelectRequest }) {
  const [expandedFolderId, setExpandedFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newRequestName, setNewRequestName] = useState({});
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [renamingRequestId, setRenamingRequestId] = useState(null);

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = { id: uuidv4(), name: newFolderName, requests: [] };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
  };

  const addRequest = (folderId) => {
    const name = newRequestName[folderId];
    if (!name?.trim()) return;
    const newReq = {
      id: uuidv4(),
      name,
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body: '',
      auth: { type: 'None', oauth2: { accessTokenUrl: '', clientId: '', clientSecret: '', token: '' } },
      lastResponse: null,
      folderId
    };
    setFolders(folders.map(f =>
        f.id === folderId
            ? { ...f, requests: [...f.requests, newReq] }
            : f
    ));
    setNewRequestName({ ...newRequestName, [folderId]: '' });
  };

  const toggleFolder = (id) => {
    setExpandedFolderId(prev => (prev === id ? null : id));
  };

  const renameFolder = (id, name) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
    setRenamingFolderId(null);
  };

  const renameRequest = (folderId, requestId, name) => {
    setFolders(folders.map(f => {
      if (f.id !== folderId) return f;
      return {
        ...f,
        requests: f.requests.map(r =>
            r.id === requestId ? { ...r, name } : r
        )
      };
    }));
    setRenamingRequestId(null);
  };

  const deleteFolder = (id) => {
    if (confirm('Delete this folder and its requests?')) {
      setFolders(folders.filter(f => f.id !== id));
    }
  };

  const deleteRequest = (folderId, requestId) => {
    setFolders(folders.map(f => {
      if (f.id !== folderId) return f;
      return {
        ...f,
        requests: f.requests.filter(r => r.id !== requestId)
      };
    }));
  };

  return (
      <div className="w-64 bg-gray-900 border-r border-gray-700 p-2 overflow-y-auto">
        <div className="flex mb-2">
          <input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="New folder"
              className="flex-1 px-2 py-1 text-sm rounded bg-gray-800 text-white"
          />
          <button onClick={addFolder} className="ml-2 px-2 text-green-400 hover:text-green-200">＋</button>
        </div>

        {folders.map(folder => (
            <div key={folder.id} className="mb-2">
              <div className="flex justify-between items-center">
                {renamingFolderId === folder.id ? (
                    <input
                        value={folder.name}
                        onChange={(e) => renameFolder(folder.id, e.target.value)}
                        onBlur={() => setRenamingFolderId(null)}
                        className="bg-gray-700 text-white text-sm px-2 py-1 rounded w-full"
                        autoFocus
                    />
                ) : (
                    <>
                      <button onClick={() => toggleFolder(folder.id)} className="text-white font-semibold text-left w-full">
                        📁 {folder.name}
                      </button>
                      <div className="flex gap-1 text-xs ml-1">
                        <button onClick={() => setRenamingFolderId(folder.id)} title="Rename">✏️</button>
                        <button onClick={() => deleteFolder(folder.id)} title="Delete">🗑️</button>
                      </div>
                    </>
                )}
              </div>

              {expandedFolderId === folder.id && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {folder.requests.map(req => (
                        <li key={req.id} className="flex justify-between items-center group">
                          {renamingRequestId === req.id ? (
                              <input
                                  value={req.name}
                                  onChange={(e) => renameRequest(folder.id, req.id, e.target.value)}
                                  onBlur={() => setRenamingRequestId(null)}
                                  className="bg-gray-700 text-white text-sm px-2 py-1 rounded w-full"
                                  autoFocus
                              />
                          ) : (
                              <button
                                  onClick={() => onSelectRequest(req)}
                                  className="text-blue-400 text-left hover:underline text-sm truncate"
                              >
                                {req.name}
                              </button>
                          )}
                          <div className="hidden group-hover:flex gap-1 text-xs">
                            <button onClick={() => setRenamingRequestId(req.id)} title="Rename">✏️</button>
                            <button onClick={() => deleteRequest(folder.id, req.id)} title="Delete">🗑️</button>
                          </div>
                        </li>
                    ))}
                    <li className="flex gap-1 mt-1">
                      <input
                          value={newRequestName[folder.id] || ''}
                          onChange={e => setNewRequestName({ ...newRequestName, [folder.id]: e.target.value })}
                          placeholder="New request"
                          className="flex-1 px-2 py-1 text-sm bg-gray-800 text-white rounded"
                      />
                      <button
                          onClick={() => addRequest(folder.id)}
                          className="text-green-400 text-sm hover:text-green-200"
                      >＋</button>
                    </li>
                  </ul>
              )}
            </div>
        ))}
      </div>
  );
}
