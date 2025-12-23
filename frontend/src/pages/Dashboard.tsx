import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, groupService, expenseService, settlementService } from '../services';
import type { BalanceSummary, Group, Expense, Settlement } from '../types';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Receipt,
    ArrowRight,
    Plus,
    Wallet,
    Clock,
    Check,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [balances, setBalances] = useState<BalanceSummary | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
    const [pendingSettlements, setPendingSettlements] = useState<Settlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;

        try {
            const [balanceData, groupsData, expensesData, pendingData] = await Promise.all([
                userService.getBalances(user._id),
                groupService.getAll(),
                expenseService.getAll(undefined, 1, 5),
                settlementService.getPending(),
            ]);

            setBalances(balanceData);
            setGroups(groupsData);
            setRecentExpenses(expensesData.data || []);
            setPendingSettlements(pendingData || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleConfirmSettlement = async (id: string) => {
        try {
            await settlementService.confirm(id);
            toast.success('Settlement confirmed! 💰');
            setPendingSettlements(prev => prev.filter(s => s._id !== id));
            // Refresh balances
            if (user) {
                const balanceData = await userService.getBalances(user._id);
                setBalances(balanceData);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to confirm settlement');
        }
    };

    const handleRejectSettlement = async (id: string) => {
        try {
            await settlementService.reject(id);
            toast.success('Settlement rejected');
            setPendingSettlements(prev => prev.filter(s => s._id !== id));
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to reject settlement');
        }
    };

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

    if (isLoading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner" style={{ width: '48px', height: '48px' }} />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="page-header animate-fade-in">
                    <h1 className="page-title">
                        Welcome back, {user?.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="page-subtitle">Here's your expense summary</p>
                </div>

                {/* Pending Settlements Alert */}
                {pendingSettlements.length > 0 && (
                    <div
                        className="card mb-6 animate-slide-up"
                        style={{
                            borderLeft: '4px solid var(--warning)',
                            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, var(--bg-tertiary) 100%)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={20} color="var(--warning)" />
                            <h3>Pending Confirmations</h3>
                            <span
                                className="badge"
                                style={{
                                    background: 'var(--warning)',
                                    color: '#000',
                                    marginLeft: '0.5rem'
                                }}
                            >
                                {pendingSettlements.length}
                            </span>
                        </div>
                        <p className="text-sm text-muted mb-4">
                            These users claim they've paid you. Please confirm or reject:
                        </p>
                        <div className="flex flex-col gap-3">
                            {pendingSettlements.map((settlement) => (
                                <div
                                    key={settlement._id}
                                    className="flex items-center gap-3 p-3"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    <div className="avatar avatar-sm">
                                        {getInitials(settlement.fromUser.name)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {settlement.fromUser.name} paid you
                                        </p>
                                        <p className="text-xs text-muted">
                                            {settlement.note || 'No note'}
                                            {settlement.group && ` • ${settlement.group.name}`}
                                        </p>
                                    </div>
                                    <p className="font-bold text-lg" style={{ color: 'var(--success)' }}>
                                        {formatCurrency(settlement.amount)}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleConfirmSettlement(settlement._id)}
                                            className="btn btn-sm"
                                            style={{
                                                background: 'var(--success)',
                                                color: '#fff',
                                                padding: '0.5rem 0.75rem'
                                            }}
                                            title="Confirm payment received"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRejectSettlement(settlement._id)}
                                            className="btn btn-sm"
                                            style={{
                                                background: 'var(--danger)',
                                                color: '#fff',
                                                padding: '0.5rem 0.75rem'
                                            }}
                                            title="Reject - payment not received"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Balance Cards */}
                <div className="grid grid-3 mb-6 animate-slide-up">
                    <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="avatar avatar-sm"
                                style={{ background: 'var(--success-light)' }}
                            >
                                <TrendingUp size={18} color="var(--success)" />
                            </div>
                            <span className="text-sm text-muted">You are owed</span>
                        </div>
                        <p className="text-2xl font-bold balance-positive">
                            {formatCurrency(balances?.totalOwed || 0)}
                        </p>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="avatar avatar-sm"
                                style={{ background: 'var(--danger-light)' }}
                            >
                                <TrendingDown size={18} color="var(--danger)" />
                            </div>
                            <span className="text-sm text-muted">You owe</span>
                        </div>
                        <p className="text-2xl font-bold balance-negative">
                            {formatCurrency(balances?.totalOwing || 0)}
                        </p>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="avatar avatar-sm"
                                style={{ background: 'var(--primary-light)' }}
                            >
                                <Wallet size={18} color="var(--primary)" />
                            </div>
                            <span className="text-sm text-muted">Net Balance</span>
                        </div>
                        <p className={`text-2xl font-bold ${(balances?.netBalance || 0) >= 0 ? 'balance-positive' : 'balance-negative'
                            }`}>
                            {formatCurrency(balances?.netBalance || 0)}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Link to="/groups/new" className="btn btn-primary">
                        <Plus size={18} />
                        New Group
                    </Link>
                    <Link to="/expenses/new" className="btn btn-secondary">
                        <Receipt size={18} />
                        Add Expense
                    </Link>
                </div>

                <div className="grid grid-2">
                    {/* Groups */}
                    <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2">
                                <Users size={20} />
                                Your Groups
                            </h3>
                            <Link to="/groups" className="btn btn-ghost text-sm">
                                View all <ArrowRight size={16} />
                            </Link>
                        </div>

                        {groups.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem' }}>
                                <p className="text-muted">No groups yet. Create one to start splitting!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {groups.slice(0, 4).map((group) => (
                                    <Link
                                        key={group._id}
                                        to={`/groups/${group._id}`}
                                        className="flex items-center gap-3 p-3"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div className="avatar">
                                            {getInitials(group.name)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{group.name}</p>
                                            <p className="text-xs text-muted">
                                                {group.members.length} members
                                            </p>
                                        </div>
                                        <ArrowRight size={18} className="text-muted" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Expenses */}
                    <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2">
                                <Receipt size={20} />
                                Recent Expenses
                            </h3>
                            <Link to="/expenses" className="btn btn-ghost text-sm">
                                View all <ArrowRight size={16} />
                            </Link>
                        </div>

                        {recentExpenses.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem' }}>
                                <p className="text-muted">No expenses yet. Add one to track spending!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentExpenses.map((expense) => (
                                    <div
                                        key={expense._id}
                                        className="flex items-center gap-3 p-3"
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        <div
                                            className="avatar avatar-sm"
                                            style={{ background: 'var(--gradient-accent)' }}
                                        >
                                            <Receipt size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{expense.description}</p>
                                            <p className="text-xs text-muted">
                                                Paid by {expense.paidBy.name}
                                            </p>
                                        </div>
                                        <p className="font-bold text-sm">
                                            {formatCurrency(expense.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Individual Balances */}
                {balances && balances.balances.length > 0 && (
                    <div className="card mt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <h3 className="mb-4">Balance Details</h3>
                        <div className="flex flex-col gap-3">
                            {balances.balances.map((balance) => (
                                <div
                                    key={balance.userId}
                                    className="flex items-center justify-between p-3"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="avatar avatar-sm">
                                            {getInitials(balance.userName)}
                                        </div>
                                        <span>{balance.userName}</span>
                                    </div>
                                    <span className={`font-bold ${balance.amount >= 0 ? 'balance-positive' : 'balance-negative'
                                        }`}>
                                        {balance.amount >= 0 ? 'owes you ' : 'you owe '}
                                        {formatCurrency(Math.abs(balance.amount))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

