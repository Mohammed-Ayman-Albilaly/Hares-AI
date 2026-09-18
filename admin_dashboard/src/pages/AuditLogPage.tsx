import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CP_API_BASE = "http://localhost:8000/api/v1";

interface AuditLogEntry {
    id: string;
    prompt_id: string;
    user_id: string | null;
    timestamp: string;
    risk_severity: string;
    detected_entities: any[];
    original_prompt: string;
    masked_prompt: string;
    justification: string | null;
}

const AuditLogPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            // Note: Currently the CP only has an inspection endpoint that creates logs.
            // We need a GET endpoint to retrieve them.
            // Assuming /api/v1/audit/logs exists or will be added.
            const response = await axios.get(`${CP_API_BASE}/audit/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch audit logs. Ensure the audit log retrieval endpoint is implemented in the Control Plane.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Audit Log Review</h2>
            <p style={{ marginBottom: '2rem' }}>Historical record of all prompt inspections and PII detections.</p>

            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '1rem', backgroundColor: '#ffeef0', borderRadius: '4px' }}>{error}</div>}

            {loading ? (
                <p>Loading logs...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Timestamp</th>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Prompt ID</th>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Severity</th>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Entities</th>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Original Prompt</th>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Masked Prompt</th>
                                <th style={{ padding: '1rem', border: '1px solid #dee2e6' }}>Justification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>No audit logs found.</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '1rem', border: '1px solid #dee2e6', fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: '1rem', border: '1px solid #dee2e6', fontSize: '0.85rem' }}>{log.prompt_id}</td>
                                        <td style={{ 
                                            padding: '1rem', 
                                            border: '1px solid #dee2e6', 
                                            fontWeight: 'bold',
                                            color: log.risk_severity === 'CRITICAL' ? 'red' : (log.risk_severity === 'MEDIUM' ? 'orange' : 'green')
                                        }}>{log.risk_severity}</td>
                                        <td style={{ padding: '1rem', border: '1px solid #dee2e6', fontSize: '0.85rem' }}>
                                            {log.detected_entities.map((e: any, i: number) => (
                                                <span key={i} style={{ 
                                                    display: 'inline-block', 
                                                    backgroundColor: '#e9ecef', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px', 
                                                    marginRight: '4px', 
                                                    fontSize: '0.75rem' 
                                                }}>{e.type}</span>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1rem', border: '1px solid #dee2e6', fontSize: '0.85rem' }}>{log.original_prompt}</td>
                                        <td style={{ padding: '1rem', border: '1px solid #dee2e6', fontSize: '0.85rem' }}>{log.masked_prompt}</td>
                                        <td style={{ padding: '1rem', border: '1px solid #dee2e6', fontSize: '0.85rem', fontStyle: 'italic', color: '#555' }}>{log.justification || 'N/A'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditLogPage;
