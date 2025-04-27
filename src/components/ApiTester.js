import React, { useState, useEffect } from "react";
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
    const [responseHeaders, setResponseHeaders] = useState({});
    const [viewTab, setViewTab] = useState("body");
    const [responseSize, setResponseSize] = useState(0);
    const [responseTime, setResponseTime] = useState(0);
    const [statusCode, setStatusCode] = useState(null);

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
                response: savedResponse,
                responseHeaders: savedResponseHeaders,
                statusCode: savedStatusCode,
                responseSize: savedResponseSize,
                responseTime: savedResponseTime,
            } = selectedRequest.request;

            setUrl(url || "");
            setMethod(method || "GET");
            setTokenUrl(tokenUrl || "");
            setClientId(clientId || "");
            setClientSecret(clientSecret || "");
            setParams(savedParams?.map(p => ({ ...p, enabled: p.enabled !== false })) || [{ key: "", value: "", enabled: true }]);
            setHeaders(savedHeaders?.map(h => ({ ...h, enabled: h.enabled !== false })) || [{ key: "", value: "", enabled: true }]);
            setRequestBody(savedRequestBody || "");
            setResponse(savedResponse || "");
            setResponseHeaders(savedResponseHeaders || {});
            setStatusCode(savedStatusCode || null);
            setResponseSize(savedResponseSize || 0);
            setResponseTime(savedResponseTime || 0);
            setViewTab("body");
        }
    }, [selectedRequest]);

    useEffect(() => {
        if (selectedRequest) autoSaveRequest();
    }, [url, method, tokenUrl, clientId, clientSecret, params, requestBody, headers, response, responseHeaders, statusCode, responseSize, responseTime]);

    const autoSaveRequest = () => {
        if (!selectedRequest) return;
        const updatedRequest = {
            ...selectedRequest,
            request: { url, method, tokenUrl, clientId, clientSecret, params, requestBody, headers, response, responseHeaders, statusCode, responseSize, responseTime },
        };
        const updatedFolders = { ...folders };
        const folderName = Object.keys(folders).find(folder => folders[folder].some(req => req.name === selectedRequest.name));
        if (folderName) {
            updatedFolders[folderName] = folders[folderName].map(req => req.name === selectedRequest.name ? updatedRequest : req);
            updateFolders(updatedFolders);
        }
    };

    const makeApiCall = async () => {
        const startTime = performance.now();
        const token = await fetchToken();

        const enabledParams = params.filter(p => p.enabled && p.key && p.value);
        const queryParamsString = enabledParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
        const finalUrl = queryParamsString ? `${url}?${queryParamsString}` : url;

        let parsedBody = {};
        try {
            parsedBody = requestBody ? JSON.parse(requestBody) : {};
        } catch (e) {
            console.error("Invalid JSON in request body:", e.message);
            setResponse("Invalid JSON in request body");
            return;
        }

        const headersObject = { "Content-Type": "application/json" };
        headers.filter(h => h.enabled && h.key && h.value).forEach(h => { headersObject[h.key] = h.value; });

        const result = await window.electronAPI.invoke("make-api-call", { url: finalUrl, method, token, headers: headersObject, body: parsedBody });

        const endTime = performance.now();
        const timeTaken = Math.round(endTime - startTime);

        setResponseTime(timeTaken);
        setStatusCode(result?.status || null);
        const stringifiedResult = JSON.stringify(result.data, null, 2);
        setResponse(stringifiedResult);
        setResponseHeaders(result?.headers || {});
        const bytes = new TextEncoder().encode(stringifiedResult).length;
        setResponseSize(bytes);
        setViewTab("body");

        if (selectedRequest) {
            const updatedRequest = {
                ...selectedRequest,
                request: {
                    url, method, tokenUrl, clientId, clientSecret, params, requestBody, headers,
                    response: stringifiedResult,
                    responseHeaders: result?.headers || {},
                    responseSize: bytes,
                    responseTime: timeTaken,
                    statusCode: result?.status || null
                }
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
            return await window.electronAPI.invoke("fetch-token", { tokenUrl, clientId, clientSecret });
        } catch (error) {
            console.error("Renderer error while fetching token:", error);
            return null;
        }
    };

    const handleParamsChange = (index, field, value) => { const updated = [...params]; updated[index][field] = value; setParams(updated); };
    const handleHeadersChange = (index, field, value) => { const updated = [...headers]; updated[index][field] = value; setHeaders(updated); };
    const handleParamCheckboxChange = (index, checked) => { const updated = [...params]; updated[index].enabled = checked; setParams(updated); };
    const handleHeaderCheckboxChange = (index, checked) => { const updated = [...headers]; updated[index].enabled = checked; setHeaders(updated); };
    const handleDeleteParam = (index) => { const updated = [...params]; updated.splice(index, 1); setParams(updated); };
    const handleDeleteHeader = (index) => { const updated = [...headers]; updated.splice(index, 1); setHeaders(updated); };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Left: Request Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                <div><label>URL:</label><input type="text" value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: "100%" }} /></div>
                <div><label>Method:</label><select value={method} onChange={(e) => setMethod(e.target.value)} style={{ width: "100%" }}><option value="GET">GET</option><option value="POST">POST</option></select></div>

                <h3>Parameters</h3>
                {params.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input type="checkbox" checked={p.enabled} onChange={(e) => handleParamCheckboxChange(i, e.target.checked)} />
                        <input value={p.key} placeholder="Key" onChange={(e) => handleParamsChange(i, "key", e.target.value)} />
                        <input value={p.value} placeholder="Value" onChange={(e) => handleParamsChange(i, "value", e.target.value)} />
                        <button onClick={() => handleDeleteParam(i)}>🗑️</button>
                    </div>
                ))}
                <button onClick={() => setParams([...params, { key: "", value: "", enabled: true }])}>Add Parameter</button>

                <h3>Headers</h3>
                {headers.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input type="checkbox" checked={h.enabled} onChange={(e) => handleHeaderCheckboxChange(i, e.target.checked)} />
                        <input value={h.key} placeholder="Key" onChange={(e) => handleHeadersChange(i, "key", e.target.value)} />
                        <input value={h.value} placeholder="Value" onChange={(e) => handleHeadersChange(i, "value", e.target.value)} />
                        <button onClick={() => handleDeleteHeader(i)}>🗑️</button>
                    </div>
                ))}
                <button onClick={() => setHeaders([...headers, { key: "", value: "", enabled: true }])}>Add Header</button>

                {method === "POST" && (
                    <div><h3>Request Body</h3><textarea value={requestBody} onChange={(e) => setRequestBody(e.target.value)} style={{ width: "100%", height: "150px" }} /></div>
                )}

                <h3>OAuth2 Authentication</h3>
                <div><label>Token URL:</label><input value={tokenUrl} onChange={(e) => setTokenUrl(e.target.value)} style={{ width: "100%" }} /></div>
                <div><label>Client ID:</label><input value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ width: "100%" }} /></div>
                <div><label>Client Secret:</label><input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} style={{ width: "100%" }} /></div>

                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button onClick={makeApiCall}>Send Request</button>
                </div>
            </div>

            {/* Right: Response Section */}
            <div style={{ flex: 1, backgroundColor: "#1e1e1e", color: "#fff", padding: "20px", overflowY: "auto" }}>
                {response && (
                    <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "16px", height: "90%", overflow: "auto", backgroundColor: "#2c2c2c" }}>
                        <div style={{ marginBottom: "10px", display: "flex", gap: "20px" }}>
                            <span><strong>Status:</strong> {statusCode}</span>
                            <span><strong>Size:</strong> {(responseSize / 1024).toFixed(2)} KB</span>
                            <span><strong>Time:</strong> {responseTime} ms</span>
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            <button onClick={() => setViewTab("body")} style={{
                                marginRight: "10px", backgroundColor: viewTab === "body" ? "#444" : "#666", color: "white"
                            }}>Body</button>
                            <button onClick={() => setViewTab("headers")} style={{
                                backgroundColor: viewTab === "headers" ? "#444" : "#666", color: "white"
                            }}>Headers</button>
                        </div>

                        {viewTab === "body" ? (
                            <JsonViewer
                                value={typeof response === "string" ? JSON.parse(response) : response}
                                theme="dark"
                                defaultInspectDepth={Infinity}
                                enableClipboard
                            />
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr>
                                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Header</th>
                                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Value</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.entries(responseHeaders).map(([key, value]) => (
                                    <tr key={key}>
                                        <td style={{
                                            border: "1px solid #ccc", padding: "8px",
                                            wordBreak: "break-word", whiteSpace: "normal", maxWidth: "400px"
                                        }}>{key}</td>
                                        <td style={{
                                            border: "1px solid #ccc", padding: "8px",
                                            wordBreak: "break-word", whiteSpace: "normal", maxWidth: "400px"
                                        }}>{value}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTester;
