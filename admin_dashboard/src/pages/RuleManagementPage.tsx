import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CP_API_BASE = "http://localhost:8000/api/v1";

const RuleManagementPage: React.FC = () => {
    const [rules, setRules] = useState<{ active_rules: string[] } | null>(null);
    const [newRule, setNewRule] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${CP_API_BASE}/guardrail/rules`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRules(response.data);
            setError('');
        } catch (err: any) {
            setError('Failed to fetch rules');
        } finally {
            setLoading(false);
        }
    };

    const addRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRule.trim()) return;
        
        try {
            const token = localStorage.getItem('access_token');
            // The current API endpoint /rules expects a full update of the rules object
            const updatedRules = {
                active_rules: [...(rules?.active_rules || []), newRule.toUpperCase()],
                settings: rules?.settings || { masking_enabled: true, block_critical: true }
            };
            
            await axios.post(`${CP_API_BASE}/guardrail/rules`, updatedRules, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNewRule('');
            await fetchRules();
        } catch (err: any) {
            setError('Failed to add rule');
        }
    };

    const removeRule = async (ruleToRemove: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const updatedRules = {
                active_rules: rules?.active_rules.filter(r => r !== ruleToRemove) || [],
                settings: rules?.settings || { masking_enabled: true, block_critical: true }
            };
            
            await axios.post(`${CP_API_BASE}/guardrail/rules`, updatedRules, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchRules();
        } catch (err: any) {
            setError('Failed to remove rule');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Guardrail Rule Management</h2>
            <p>Configure the PII entities that the Interception Layer should detect and mask.</p>
            
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                border: '1px solid #dee2e6' 
            }}>
                <h3>Add New Rule</h3>
                <form onSubmit={addRule} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={newRule} 
                        onChange={(e) => setNewRule(e.target.value)} 
                        placeholder="e.g. CREDIT_CARD" 
                        style={{ padding: '0.5rem', flexGrow: 1 }} 
                    />
                    <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Add</button>
                </form>
            </div>

            <h3>Active Rules</h3>
            {loading ? (
                <p>Loading rules...</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {rules?.active_rules.map(rule => (
                        <li key={rule} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.75rem', 
                            backgroundColor: 'white', 
                            border: '1px solid #dee2e6', 
                            borderRadius: '4px', 
                            marginBottom: '0.5rem' 
                        }}>
                            <span>{rule}</span>
                            <button 
                                onClick={() => removeRule(rule)} 
                                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RuleManagementPage;
