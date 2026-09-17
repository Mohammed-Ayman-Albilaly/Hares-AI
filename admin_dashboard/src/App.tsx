import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RuleManagementPage from './pages/RuleManagementPage';
import AuditLogPage from './pages/AuditLogPage';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem 2rem', 
                backgroundColor: '#fff', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderBottom: '1px solid #dee2e6'
            }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333', fontSize: '1.2rem' }}>Hares AI Admin</Link>
                    <Link to="/rules" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>Rules</Link>
                    <Link to="/audit" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>Audit Logs</Link>
                </div>
                <button 
                    onClick={() => {
                        localStorage.removeItem('access_token');
                        window.location.href = '/login';
                    }}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                    }}
                >
                    Logout
                </button>
            </nav>
            <main style={{ padding: '2rem' }}>
                {children}
            </main>
        </div>
    );
};

const DashboardHome = () => {
    return (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h1>Welcome to the Hares AI Control Plane</h1>
            <p>Manage your guardrail rules and monitor PII leakage in real-time.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/rules" style={{ padding: '1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Configure Rules</Link>
                <Link to="/audit" style={{ padding: '1rem', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>View Audit Logs</Link>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <DashboardHome />
                                </Layout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/rules" 
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <RuleManagementPage />
                                </Layout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/audit" 
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <AuditLogPage />
                                </Layout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
