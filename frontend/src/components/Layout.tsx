import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, Receipt, LogOut, Wallet } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/groups', icon: Users, label: 'Groups' },
        { path: '/expenses', icon: Receipt, label: 'Expenses' },
    ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: '260px',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <div
                    className="flex items-center gap-4 p-5"
                    style={{
                        borderBottom: '1px solid var(--border)',
                    }}
                >
                    <div
                        className="avatar"
                        style={{
                            background: 'var(--gradient-primary)',
                            width: '44px',
                            height: '44px',
                        }}
                    >
                        <Wallet size={22} />
                    </div>
                    <div>
                        <h1 className="font-bold" style={{ fontSize: '1.25rem' }}>
                            SplitShare
                        </h1>
                        <p className="text-sm text-muted">Expense Manager</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1" style={{ padding: '1.5rem 1rem', marginTop: '0.5rem' }}>
                    <ul className="flex flex-col gap-3">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className="flex items-center gap-4 px-4 py-3"
                                    style={{
                                        borderRadius: 'var(--radius-md)',
                                        transition: 'all 0.2s ease',
                                        background: isActive(item.path) ? 'var(--primary-light)' : 'transparent',
                                        color: isActive(item.path) ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: isActive(item.path) ? 600 : 500,
                                        fontSize: '1.05rem',
                                    }}
                                >
                                    <item.icon size={22} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div
                    className="p-5"
                    style={{
                        borderTop: '1px solid var(--border)',
                    }}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="avatar avatar-sm">{user ? getInitials(user.name) : '?'}</div>
                        <div className="flex-1" style={{ minWidth: 0 }}>
                            <p className="font-medium" style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name}
                            </p>
                            <p className="text-sm text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost w-full"
                        style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: '260px', flex: 1 }}>{children}</main>
        </div>
    );
};

export default Layout;
