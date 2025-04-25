import React, { useState } from "react";
import ReactJson from 'react18-json-view';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const ApiTester = () => {
    const [url, setUrl] = useState("");
    const [method, setMethod] = useState("GET");
    const [params, setParams] = useState([{ key: "", value: "" }]);
    const [requestBody, setRequestBody] = useState("");
    const [tokenUrl, setTokenUrl] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [response, setResponse] = useState("");
    const [viewMode, setViewMode] = useState("tree");

    const handleParamsChange = (index, field, value) => {
        const updatedParams = [...params];
        updatedParams[index][field] = value;
        setParams(updatedParams);
    };

    const fetchToken = async () => {
        try {
            const token = await window.electronAPI.invoke("fetch-token", {
                tokenUrl,
                clientId,
                clientSecret,
            });

            console.log("Token received:", token);
            return token;
        } catch (error) {
            console.error("Renderer error while fetching token:", error);
            return null;
        }
    };

    const makeApiCall = async () => {
        const token = await fetchToken();

        // Build query params string
        const queryParams = params
            .filter((p) => p.key && p.value)
            .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join("&");

        // Append to URL
        const finalUrl = queryParams ? `${url}?${queryParams}` : url;

        // Parse request body safely
        let parsedBody = {};
        try {
            parsedBody = requestBody ? JSON.parse(requestBody) : {};
        } catch (e) {
            console.error("Invalid JSON in request body:", e.message);
            setResponse("Invalid JSON in request body");
            return;
        }

        const result = await window.electronAPI.invoke("make-api-call", {
            url: finalUrl,
            method,
            token,
            headers: {
                "X-Correlation-ID": "shivam",
            },
            body: parsedBody
        });

        console.log("API response:", result);
        setResponse(JSON.stringify(result, null, 2));
    };

    return (
        <div className="p-4">
            <div>
                <label>URL:</label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>

            <div>
                <label>Method:</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                </select>
            </div>

            <div>
                <h3>Parameters</h3>
                {params.map((param, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) => handleParamsChange(index, "key", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => handleParamsChange(index, "value", e.target.value)}
                        />
                    </div>
                ))}
                <button onClick={() => setParams([...params, { key: "", value: "" }])}>
                    Add Parameter
                </button>
            </div>

            {method === "POST" && (
                <div>
                    <h3>Request Body</h3>
                    <textarea value={requestBody} onChange={(e) => setRequestBody(e.target.value)} />
                </div>
            )}

            <div>
                <h3>OAuth2 Authentication</h3>
                <label>Token URL:</label>
                <input type="text" value={tokenUrl} onChange={(e) => setTokenUrl(e.target.value)} />
                <label>Client ID:</label>
                <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} />
                <label>Client Secret:</label>
                <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
            </div>

            <button onClick={makeApiCall}>Send Request</button>

            {response && (
                /*<div style={{ marginTop: "20px", textAlign: "left" }}>
                    <h3>JSON (Tree View)</h3>
                    <ReactJson
                        src={typeof response === "string" ? JSON.parse(response) : response}
                        collapsed={1}
                        enableClipboard={true}
                    />
                    <h3>JSON (Syntax Highlighted)</h3>
                    <SyntaxHighlighter language="json" style={oneDark}>
                        {JSON.stringify(typeof response === "string" ? JSON.parse(response) : response, null, 2)}
                    </SyntaxHighlighter>
                </div>*/
                <div style={{border: "1px solid #ccc", borderRadius: "10px", padding: "16px", marginTop: "20px"}}>
                    <div style={{marginBottom: "10px"}}>
                        <button onClick={() => setViewMode("tree")}>Tree View</button>
                        <button onClick={() => setViewMode("raw")}>Raw JSON</button>
                    </div>

                    {viewMode === "tree" ? (
                        <ReactJson
                            src={typeof response === "string" ? JSON.parse(response) : response}
                            collapsed={1}
                            enableClipboard={true}
                        />
                    ) : (
                        <SyntaxHighlighter language="json" style={oneDark}>
                            {JSON.stringify(typeof response === "string" ? JSON.parse(response) : response, null, 2)}
                        </SyntaxHighlighter>
                    )}
                </div>

            )}

        </div>
    );
};

export default ApiTester;
