import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import Expenses from './pages/Expenses';
import CreateExpense from './pages/CreateExpense';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner" style={{ width: '48px', height: '48px' }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Public Route wrapper (redirect to home if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner" style={{ width: '48px', height: '48px' }} />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/groups"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Groups />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/groups/new"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreateGroup />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/groups/:id"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <GroupDetail />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/expenses"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Expenses />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/expenses/new"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreateExpense />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                        },
                        success: {
                            iconTheme: {
                                primary: 'var(--success)',
                                secondary: 'white',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: 'var(--danger)',
                                secondary: 'white',
                            },
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
