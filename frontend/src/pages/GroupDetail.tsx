import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupService, expenseService } from '../services';
import type { Group, Expense, SettlementSuggestion } from '../types';
import {
    ArrowLeft,
    Users,
    Receipt,
    Plus,
    ArrowRight,
    Wallet,
    CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [settlements, setSettlements] = useState<SettlementSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                const [groupData, expensesData, balancesData] = await Promise.all([
                    groupService.getById(id),
                    expenseService.getAll(id),
                    groupService.getBalances(id),
                ]);

                setGroup(groupData);
                setExpenses(expensesData.data || []);
                setSettlements(balancesData.settlementSuggestions || []);
            } catch (error: any) {
                toast.error(error.response?.data?.error || 'Failed to load group');
                navigate('/groups');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading || !group) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner" style={{ width: '48px', height: '48px' }} />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <button onClick={() => navigate('/groups')} className="btn btn-ghost mb-4 animate-fade-in">
                    <ArrowLeft size={18} />
                    Back to Groups
                </button>

                {/* Group Header */}
                <div className="card mb-6 animate-slide-up">
                    <div className="flex items-center gap-4">
                        <div
                            className="avatar avatar-lg"
                            style={{ background: 'var(--gradient-primary)' }}
                        >
                            <Users size={24} />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{group.name}</h1>
                            {group.description && (
                                <p className="text-muted">{group.description}</p>
                            )}
                            <p className="text-sm text-muted mt-1">
                                {group.members.length} members • Created {formatDate(group.createdAt)}
                            </p>
                        </div>
                        <Link to={`/expenses/new?groupId=${id}`} className="btn btn-primary">
                            <Plus size={18} />
                            Add Expense
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {(['expenses', 'balances', 'members'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {tab === 'expenses' && <Receipt size={18} />}
                            {tab === 'balances' && <Wallet size={18} />}
                            {tab === 'members' && <Users size={18} />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {activeTab === 'expenses' && (
                        <div className="card">
                            <h3 className="mb-4">Expenses ({expenses.length})</h3>
                            {expenses.length === 0 ? (
                                <div className="empty-state">
                                    <Receipt size={48} className="empty-state-icon" />
                                    <h4 className="empty-state-title">No expenses yet</h4>
                                    <p className="empty-state-text">Add your first expense to this group</p>
                                    <Link to={`/expenses/new?groupId=${id}`} className="btn btn-primary">
                                        <Plus size={18} />
                                        Add Expense
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {expenses.map((expense) => (
                                        <div
                                            key={expense._id}
                                            className="flex items-center gap-4 p-4"
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                            }}
                                        >
                                            <div
                                                className="avatar"
                                                style={{ background: 'var(--gradient-accent)' }}
                                            >
                                                <Receipt size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold">{expense.description}</p>
                                                <p className="text-sm text-muted">
                                                    Paid by <span className="text-primary">{expense.paidBy.name}</span> • {formatDate(expense.createdAt)}
                                                </p>
                                                <span className="badge badge-primary mt-1">
                                                    {expense.splitType}
                                                </span>
                                            </div>
                                            <p className="text-xl font-bold">{formatCurrency(expense.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'balances' && (
                        <div className="card">
                            <h3 className="mb-4">Settlement Suggestions</h3>
                            {settlements.length === 0 ? (
                                <div className="empty-state">
                                    <CheckCircle size={48} className="empty-state-icon" style={{ color: 'var(--success)' }} />
                                    <h4 className="empty-state-title">All settled up! 🎉</h4>
                                    <p className="empty-state-text">No pending balances in this group</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-muted mb-2">
                                        Here are the optimized payments to settle all balances:
                                    </p>
                                    {settlements.map((settlement, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-4"
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                            }}
                                        >
                                            <div className="avatar avatar-sm">{getInitials(settlement.from.name)}</div>
                                            <span className="font-medium">{settlement.from.name}</span>
                                            <ArrowRight size={18} className="text-muted" />
                                            <div className="avatar avatar-sm">{getInitials(settlement.to.name)}</div>
                                            <span className="font-medium">{settlement.to.name}</span>
                                            <span className="ml-auto text-xl font-bold text-primary">
                                                {formatCurrency(settlement.amount)}
                                            </span>
                                            <Link
                                                to={`/settlements/new?groupId=${id}&from=${settlement.from.userId}&to=${settlement.to.userId}&amount=${settlement.amount}`}
                                                className="btn btn-success btn-sm"
                                                style={{ padding: '0.5rem 1rem' }}
                                            >
                                                Settle
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="card">
                            <h3 className="mb-4">Members ({group.members.length})</h3>
                            <div className="flex flex-col gap-3">
                                {group.members.map((member, index) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center gap-4 p-4"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        <div
                                            className="avatar"
                                            style={{
                                                background: `hsl(${(index * 50) % 360}, 70%, 50%)`,
                                            }}
                                        >
                                            {getInitials(member.name)}
                                        </div>
                                        <div>
                                            <p className="font-bold">{member.name}</p>
                                            <p className="text-sm text-muted">{member.email}</p>
                                        </div>
                                        {member._id === group.createdBy._id && (
                                            <span className="badge badge-primary ml-auto">Admin</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetail;
