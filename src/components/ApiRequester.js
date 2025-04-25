import React, { useState } from 'react';
import axios from 'axios';

function ApiRequester() {
    const [url, setUrl] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const sendRequest = async () => {
        setLoading(true);
        try {
            const res = await axios.get(url);
            setResponse(res);
            setError(null);
        } catch (err) {
            setError(err.message);
            setResponse(null);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <input
                type="text"
                placeholder="Enter GET URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '70%', padding: '10px' }}
            />
            <button onClick={sendRequest} style={{ padding: '10px', marginLeft: '10px' }}>
                Send
            </button>

            {loading && <p>Loading...</p>}

            {response && (
                <div style={{ textAlign: 'left', marginTop: '20px' }}>
                    <h3>Status: {response.status}</h3>
                    <pre>{JSON.stringify(response.data, null, 2)}</pre>
                </div>
            )}

            {error && (
                <div style={{ color: 'red', marginTop: '20px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
}

export default ApiRequester;
