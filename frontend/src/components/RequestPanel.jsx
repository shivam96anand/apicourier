import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const TABS = ['Params', 'Headers', 'Body', 'Auth'];
const AUTH_TYPES = ['None', 'Basic', 'OAuth 1.0', 'OAuth 2.0'];

export default function RequestPanel({ selectedRequest, theme, onToggleTheme, onSendResponse, onUpdateRequest }) {
    const [method, setMethod] = useState('');
    const [url, setUrl] = useState('');
    const [tab, setTab] = useState('Params');
    const [params, setParams] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [body, setBody] = useState('');
    const [authType, setAuthType] = useState('None');
    const [oauthConfig, setOauthConfig] = useState({
        accessTokenUrl: '',
        clientId: '',
        clientSecret: '',
        token: ''
    });

    useEffect(() => {
        if (selectedRequest) {
            setMethod(selectedRequest.method || 'GET');
            setUrl(selectedRequest.url || '');
            setParams(selectedRequest.params || []);
            setHeaders(selectedRequest.headers || []);
            setBody(selectedRequest.body || '');
            setAuthType(selectedRequest.auth?.type || 'None');
            setOauthConfig(selectedRequest.auth?.oauth2 || {
                accessTokenUrl: '',
                clientId: '',
                clientSecret: '',
                token: ''
            });
        } else {
            setMethod('GET');
            setUrl('');
            setParams([]);
            setHeaders([]);
            setBody('');
            setAuthType('None');
            setOauthConfig({
                accessTokenUrl: '',
                clientId: '',
                clientSecret: '',
                token: ''
            });
        }
    }, [selectedRequest]);

    // Keep request data synced
    useEffect(() => {
        if (!selectedRequest) return;
        onUpdateRequest({
            ...selectedRequest,
            method,
            url,
            params,
            headers,
            body,
            auth: {
                type: authType,
                oauth2: { ...oauthConfig }
            }
        });
    }, [method, url, params, headers, body, authType, oauthConfig]);

    const updateKeyValue = (list, setList, index, field, value) => {
        const updated = [...list];
        updated[index][field] = value;
        setList(updated);
    };

    const addKeyValue = (list, setList) => {
        setList([...list, { key: '', value: '' }]);
    };

    const removeKeyValue = (list, setList, index) => {
        const updated = [...list];
        updated.splice(index, 1);
        setList(updated);
    };

    const generateOAuth2Token = async () => {
        const { accessTokenUrl, clientId, clientSecret } = oauthConfig;
        if (!accessTokenUrl || !clientId || !clientSecret) {
            alert('Please fill all OAuth fields.');
            return;
        }

        try {
            const result = await window?.electronAPI?.fetchToken?.({
                tokenUrl: accessTokenUrl,
                clientId,
                clientSecret
            });

            if (typeof result === 'string') {
                setOauthConfig(prev => ({ ...prev, token: result }));
            } else if (result?.error) {
                alert('Token fetch error: ' + result.error);
            } else {
                alert('Token fetch failed: ' + JSON.stringify(result));
            }
        } catch (error) {
            alert('Token fetch error: ' + error.message);
        }
    };

    const handleSend = async () => {
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        const queryParams = params
            .filter(p => p.key && p.value)
            .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join('&');

        const fullUrl = queryParams ? `${url}?${queryParams}` : url;

        const headersObj = {};
        headers.forEach(({ key, value }) => {
            if (key) headersObj[key] = value;
        });

        const token = authType === 'OAuth 2.0' ? oauthConfig.token : '';

        try {
            const result = await window.electronAPI.makeApiCall({
                url: fullUrl,
                method,
                token,
                headers: headersObj,
                body: body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
                    ? JSON.parse(body)
                    : undefined
            });

            const finalResponse = {
                ...result,
                timestamp: new Date().toLocaleTimeString()
            };

            onSendResponse(finalResponse);
        } catch (err) {
            console.error('Send failed:', err);
            alert('API call failed: ' + err.message);
        }
    };

    return (
        <div className="bg-gray-800 p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 w-full">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="bg-gray-700 text-white px-2 py-1 rounded"
                    >
                        {HTTP_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="w-full px-3 py-1 rounded bg-gray-700 text-white"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-purple-600 px-4 py-1 text-white rounded hover:bg-purple-500"
                    >
                        Send
                    </button>
                </div>
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>

            <div className="flex border-b border-gray-700 mb-2">
                {TABS.map(t => (
                    <button
                        key={t}
                        className={`px-4 py-1 text-sm ${tab === t ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setTab(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Params' && (
                <div className="space-y-2">
                    {params.map((p, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={p.key}
                                onChange={(e) => updateKeyValue(params, setParams, i, 'key', e.target.value)}
                                placeholder="Key"
                                className="flex-1 px-2 py-1 bg-gray-700 text-white rounded"
                            />
                            <input
                                value={p.value}
                                onChange={(e) => updateKeyValue(params, setParams, i, 'value', e.target.value)}
                                placeholder="Value"
                                className="flex-1 px-2 py-1 bg-gray-700 text-white rounded"
                            />
                            <button onClick={() => removeKeyValue(params, setParams, i)} className="text-red-400 text-sm">✖</button>
                        </div>
                    ))}
                    <button onClick={() => addKeyValue(params, setParams)} className="text-blue-400 text-sm hover:underline">+ Add Param</button>
                </div>
            )}

            {tab === 'Headers' && (
                <div className="space-y-2">
                    {headers.map((h, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={h.key}
                                onChange={(e) => updateKeyValue(headers, setHeaders, i, 'key', e.target.value)}
                                placeholder="Header"
                                className="flex-1 px-2 py-1 bg-gray-700 text-white rounded"
                            />
                            <input
                                value={h.value}
                                onChange={(e) => updateKeyValue(headers, setHeaders, i, 'value', e.target.value)}
                                placeholder="Value"
                                className="flex-1 px-2 py-1 bg-gray-700 text-white rounded"
                            />
                            <button onClick={() => removeKeyValue(headers, setHeaders, i)} className="text-red-400 text-sm">✖</button>
                        </div>
                    ))}
                    <button onClick={() => addKeyValue(headers, setHeaders)} className="text-blue-400 text-sm hover:underline">+ Add Header</button>
                </div>
            )}

            {tab === 'Body' && (
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded resize-none"
                    placeholder="Raw JSON body..."
                />
            )}

            {tab === 'Auth' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm">Auth Type:</label>
                        <select
                            value={authType}
                            onChange={(e) => setAuthType(e.target.value)}
                            className="ml-2 px-2 py-1 bg-gray-700 text-white rounded"
                        >
                            {AUTH_TYPES.map(type => <option key={type}>{type}</option>)}
                        </select>
                    </div>

                    {authType === 'OAuth 2.0' && (
                        <div className="space-y-2">
                            <input
                                value={oauthConfig.accessTokenUrl}
                                onChange={(e) => setOauthConfig(prev => ({ ...prev, accessTokenUrl: e.target.value }))}
                                placeholder="Access Token URL"
                                className="w-full px-3 py-1 bg-gray-800 text-white rounded"
                            />
                            <input
                                value={oauthConfig.clientId}
                                onChange={(e) => setOauthConfig(prev => ({ ...prev, clientId: e.target.value }))}
                                placeholder="Client ID"
                                className="w-full px-3 py-1 bg-gray-800 text-white rounded"
                            />
                            <input
                                value={oauthConfig.clientSecret}
                                onChange={(e) => setOauthConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                                placeholder="Client Secret"
                                className="w-full px-3 py-1 bg-gray-800 text-white rounded"
                            />
                            <button
                                onClick={generateOAuth2Token}
                                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-500"
                            >
                                Generate Token
                            </button>

                            {oauthConfig.token && (
                                <div className="bg-gray-700 text-green-300 p-2 rounded text-xs break-all">
                                    <strong>Token:</strong><br />{oauthConfig.token}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
