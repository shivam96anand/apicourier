import React, { useState, useEffect } from "react";

const Sidebar = ({ folders, setFolders, selectRequest }) => {
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

    return (
        <div style={{ width: "250px", padding: "10px", borderRight: "1px solid #ccc" }}>
            <h3>Folders</h3>
            <input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="New Folder" />
            <button onClick={addFolder}>Add</button>

            {Object.entries(folders).map(([folder, requests]) => (
                <div key={folder}>
                    <h4 onClick={() => setActiveFolder(folder)} style={{ cursor: "pointer" }}>📁 {folder}</h4>
                    {folder === activeFolder && (
                        <div style={{ marginLeft: "10px" }}>
                            {requests.map((req, i) => (
                                <p
                                    key={i}
                                    onClick={() => selectRequest(req)}
                                    style={{ cursor: "pointer" }}
                                >
                                    📄 {req.name}
                                </p>
                            ))}
                            <input value={requestName} onChange={e => setRequestName(e.target.value)} placeholder="New Request" />
                            <button onClick={addRequestToFolder}>+</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
