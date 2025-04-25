import React, { useState } from "react";
import ApiTester from "./components/ApiTester";
import Sidebar from "./components/Sidebar";

const App = () => {
    const [folders, setFolders] = useState(() => {
        const storedFolders = localStorage.getItem("apiCourierFolders");
        return storedFolders ? JSON.parse(storedFolders) : {};
    });

    const [selectedRequest, setSelectedRequest] = useState(null);  // ✅ you missed this earlier

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <Sidebar
                folders={folders}
                setFolders={setFolders}
                selectRequest={(req) => setSelectedRequest(req)}
            />
            <div style={{ flex: 1, padding: "20px" }}>
                <h1 className="text-2xl font-bold mb-4">API Courier</h1>
                <ApiTester selectedRequest={selectedRequest} updateFolders={setFolders} folders={folders} />
            </div>
        </div>
    );
};

export default App;
