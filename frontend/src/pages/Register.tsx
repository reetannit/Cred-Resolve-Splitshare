import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await register({ name, email, password, phone: phone || undefined });
            toast.success('Account created successfully! 🎉');
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page flex items-center justify-center" style={{ minHeight: '100vh' }}>
            <div className="card card-glass animate-slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                <div className="text-center mb-6">
                    <div
                        className="avatar avatar-lg mb-4"
                        style={{
                            margin: '0 auto',
                            background: 'var(--gradient-success)',
                            width: '72px',
                            height: '72px',
                        }}
                    >
                        <Wallet size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-muted text-sm mt-2">Start splitting expenses with friends</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <Phone
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }}
                            />
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="10-digit number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                pattern="[0-9]{10}"
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        {isLoading ? <div className="spinner" style={{ width: '20px', height: '20px' }} /> : 'Create Account'}
                    </button>
                </form>

                <div className="divider" />

                <p className="text-center text-sm text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
