import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { JsonViewer } from "@textea/json-viewer";

const ApiTester = ({ selectedRequest, folders, updateFolders }) => {
    const [url, setUrl] = useState("");
    const [method, setMethod] = useState("GET");
    const [params, setParams] = useState([{ key: "", value: "", enabled: true }]);
    const [headers, setHeaders] = useState([{ key: "", value: "", enabled: true }]);
    const [requestBody, setRequestBody] = useState("");
    const [tokenUrl, setTokenUrl] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [response, setResponse] = useState("");
    const [viewMode, setViewMode] = useState("tree");
    const [responseSize, setResponseSize] = useState(0);
    const [responseTime, setResponseTime] = useState(0);

    // Load selected request details
    useEffect(() => {
        if (selectedRequest?.request) {
            const {
                url,
                method,
                tokenUrl,
                clientId,
                clientSecret,
                params: savedParams,
                requestBody: savedRequestBody,
                headers: savedHeaders,
            } = selectedRequest.request;

            setUrl(url || "");
            setMethod(method || "GET");
            setTokenUrl(tokenUrl || "");
            setClientId(clientId || "");
            setClientSecret(clientSecret || "");

            // Ensure "enabled" field is present in loaded params and headers
            setParams(
                savedParams?.map(p => ({ ...p, enabled: p.enabled !== false })) || [{ key: "", value: "", enabled: true }]
            );
            setHeaders(
                savedHeaders?.map(h => ({ ...h, enabled: h.enabled !== false })) || [{ key: "", value: "", enabled: true }]
            );
            setRequestBody(savedRequestBody || "");
            setResponse(selectedRequest.response || "");
        }
    }, [selectedRequest]);

    // Auto-save on any change
    useEffect(() => {
        if (selectedRequest) {
            autoSaveRequest();
        }
    }, [url, method, tokenUrl, clientId, clientSecret, params, requestBody, headers]);

    const autoSaveRequest = () => {
        if (!selectedRequest) return;

        const updatedRequest = {
            ...selectedRequest,
            request: {
                url,
                method,
                tokenUrl,
                clientId,
                clientSecret,
                params,
                requestBody,
                headers,
            },
        };

        const updatedFolders = { ...folders };
        const folderName = Object.keys(folders).find(folder =>
            folders[folder].some(req => req.name === selectedRequest.name)
        );

        if (folderName) {
            const updatedRequests = folders[folderName].map(req =>
                req.name === selectedRequest.name ? updatedRequest : req
            );
            updatedFolders[folderName] = updatedRequests;
            updateFolders(updatedFolders);
        }
    };

    const makeApiCall = async () => {
        const startTime = performance.now();  // ⏱️ Start timer
        const token = await fetchToken();

        // Only include enabled params
        const enabledParams = params.filter(p => p.enabled && p.key && p.value);
        const queryParamsString = enabledParams
            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join("&");

        const finalUrl = queryParamsString ? `${url}?${queryParamsString}` : url;

        let parsedBody = {};
        try {
            parsedBody = requestBody ? JSON.parse(requestBody) : {};
        } catch (e) {
            console.error("Invalid JSON in request body:", e.message);
            setResponse("Invalid JSON in request body");
            return;
        }

        // Only include enabled headers
        const headersObject = {
            "Content-Type": "application/json",
        };
        const enabledHeaders = headers.filter(h => h.enabled && h.key && h.value);
        enabledHeaders.forEach(h => {
            headersObject[h.key] = h.value;
        });

        const result = await window.electronAPI.invoke("make-api-call", {
            url: finalUrl,
            method,
            token,
            headers: headersObject,
            body: parsedBody
        });

        const endTime = performance.now();  // ⏱️ End timer
        const timeTaken = Math.round(endTime - startTime); // in milliseconds
        setResponseTime(timeTaken); // ⏱️ Save time

        console.log("API response:", result);
        const stringifiedResult = JSON.stringify(result, null, 2);
        setResponse(stringifiedResult);

        const bytes = new TextEncoder().encode(stringifiedResult).length;
        setResponseSize(bytes);

        // Save response inside request
        if (selectedRequest) {
            const updatedRequest = {
                ...selectedRequest,
                response: stringifiedResult,
            };

            const updatedFolders = { ...folders };
            const folderName = Object.keys(folders).find(folder =>
                folders[folder].some(req => req.name === selectedRequest.name)
            );

            if (folderName) {
                const updatedRequests = folders[folderName].map(req =>
                    req.name === selectedRequest.name ? updatedRequest : req
                );
                updatedFolders[folderName] = updatedRequests;
                updateFolders(updatedFolders);
            }
        }
    };

    const fetchToken = async () => {
        try {
            const token = await window.electronAPI.invoke("fetch-token", {
                tokenUrl,
                clientId,
                clientSecret,
            });
            return token;
        } catch (error) {
            console.error("Renderer error while fetching token:", error);
            return null;
        }
    };

    // Parameter and Header Handlers
    const handleHeadersChange = (index, field, value) => {
        const updatedHeaders = [...headers];
        updatedHeaders[index][field] = value;
        setHeaders(updatedHeaders);
    };

    const handleParamsChange = (index, field, value) => {
        const updatedParams = [...params];
        updatedParams[index][field] = value;
        setParams(updatedParams);
    };

    const handleParamCheckboxChange = (index, isChecked) => {
        const updatedParams = [...params];
        updatedParams[index].enabled = isChecked;
        setParams(updatedParams);
    };

    const handleHeaderCheckboxChange = (index, isChecked) => {
        const updatedHeaders = [...headers];
        updatedHeaders[index].enabled = isChecked;
        setHeaders(updatedHeaders);
    };

    const handleDeleteParam = (index) => {
        const updatedParams = [...params];
        updatedParams.splice(index, 1);
        setParams(updatedParams);
    };

    const handleDeleteHeader = (index) => {
        const updatedHeaders = [...headers];
        updatedHeaders.splice(index, 1);
        setHeaders(updatedHeaders);
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
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            checked={param.enabled}
                            onChange={(e) => handleParamCheckboxChange(index, e.target.checked)}
                        />
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
                        <button onClick={() => handleDeleteParam(index)}>🗑️</button>
                    </div>
                ))}
                <button onClick={() => setParams([...params, { key: "", value: "", enabled: true }])}>
                    Add Parameter
                </button>
            </div>

            <div>
                <h3>Headers</h3>
                {headers.map((header, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            checked={header.enabled}
                            onChange={(e) => handleHeaderCheckboxChange(index, e.target.checked)}
                        />
                        <input
                            type="text"
                            placeholder="Header Key"
                            value={header.key}
                            onChange={(e) => handleHeadersChange(index, "key", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Header Value"
                            value={header.value}
                            onChange={(e) => handleHeadersChange(index, "value", e.target.value)}
                        />
                        <button onClick={() => handleDeleteHeader(index)}>🗑️</button>
                    </div>
                ))}
                <button onClick={() => setHeaders([...headers, { key: "", value: "", enabled: true }])}>
                    Add Header
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

            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button onClick={makeApiCall}>Send Request</button>
            </div>

            {response && (
                <div style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "16px",
                    marginTop: "20px",
                    height: "400px",           // Fixed height
                    overflow: "auto",          // Enable both horizontal and vertical scroll
                    backgroundColor: "#f9f9f9"
                }}>

                    <div style={{marginBottom: "10px", display: "flex", gap: "20px"}}>
                        <span><strong>Size:</strong> {(responseSize / 1024).toFixed(2)} KB</span>
                        <span><strong>Time:</strong> {responseTime} ms</span>
                    </div>

                    <div style={{marginBottom: "10px"}}>
                        <button onClick={() => setViewMode("tree")}>Tree View</button>
                        <button onClick={() => setViewMode("raw")}>Raw JSON</button>
                    </div>

                    {viewMode === "tree" ? (
                        <JsonViewer
                            value={typeof response === "string" ? JSON.parse(response) : response}
                            theme="light"
                            defaultInspectDepth={2}  // How many levels open by default
                            enableClipboard
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
