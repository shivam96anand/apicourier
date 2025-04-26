import React, { useState, useEffect } from "react";

const Sidebar = ({ folders, setFolders, selectRequest, setSelectedRequest }) => {

    const [folderName, setFolderName] = useState("");
    const [requestName, setRequestName] = useState("");
    const [activeFolder, setActiveFolder] = useState(null);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("apiCourierFolders", JSON.stringify(folders));
    }, [folders]);

    const addFolder = () => {
        if (!folderName.trim() || folders[folderName]) return;
        setFolders({ ...folders, [folderName]: [] });
        setFolderName("");
    };

    const addRequestToFolder = () => {
        if (!activeFolder || !requestName.trim()) return;
        const newRequest = {
            name: requestName,
            request: {
                url: "",
                method: "GET",
                tokenUrl: "",
                clientId: "",
                clientSecret: ""
            }
        };
        setFolders({
            ...folders,
            [activeFolder]: [...folders[activeFolder], newRequest]
        });
        setRequestName("");
    };

    const handleDeleteFolder = (folderName) => {
        const confirmed = window.confirm(`Are you sure you want to delete folder "${folderName}"?`);
        if (!confirmed) return;

        const updatedFolders = { ...folders };
        delete updatedFolders[folderName];
        setFolders(updatedFolders);
        setSelectedRequest(null); // 🆕 Clear the selected request
    };

    const handleDeleteRequest = (folderName, requestName) => {
        const confirmed = window.confirm(`Are you sure you want to delete request "${requestName}" from folder "${folderName}"?`);
        if (!confirmed) return;

        const updatedFolders = { ...folders };
        updatedFolders[folderName] = updatedFolders[folderName].filter(req => req.name !== requestName);
        setFolders(updatedFolders);
        setSelectedRequest(null); // 🆕 Clear the selected request
    };

    return (
        <div style={{ width: "250px", padding: "10px", borderRight: "1px solid #ccc" }}>
            <h3>Folders</h3>
            <input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="New Folder" />
            <button onClick={addFolder}>Add</button>

            {Object.entries(folders).map(([folder, requests]) => (
                <div key={folder}>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <h4 onClick={() => setActiveFolder(prev => (prev === folder ? null : folder))}
                            style={{cursor: "pointer", margin: 0}}>
                            📁 {folder}
                        </h4>
                        <button onClick={() => handleDeleteFolder(folder)}
                                style={{marginLeft: "8px", cursor: "pointer"}}>
                            🗑️
                        </button>
                    </div>

                    {folder === activeFolder && (
                        <div style={{marginLeft: "10px"}}>
                            {requests.map((req, i) => (
                                <div key={i}
                                     style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                    <p
                                        onClick={() => selectRequest(req)}
                                        style={{cursor: "pointer", margin: 0}}
                                    >
                                        📄 {req.name}
                                    </p>
                                    <button onClick={() => handleDeleteRequest(folder, req.name)}
                                            style={{marginLeft: "8px", cursor: "pointer"}}>
                                        🗑️
                                    </button>
                                </div>

                            ))}
                            <input value={requestName} onChange={e => setRequestName(e.target.value)}
                                   placeholder="New Request"/>
                            <button onClick={addRequestToFolder}>+</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
