import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expenseService, groupService, userService } from '../services';
import { SplitType } from '../types';
import type { Group, User } from '../types';
import { ArrowLeft, Receipt, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateExpense: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const groupIdFromUrl = searchParams.get('groupId');

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(user?._id || '');
    const [groupId, setGroupId] = useState(groupIdFromUrl || '');
    const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
    const [splits, setSplits] = useState<{ userId: string; amount: string }[]>([]);

    const [groups, setGroups] = useState<Group[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupsData, usersData] = await Promise.all([
                    groupService.getAll(),
                    userService.getAll(),
                ]);
                setGroups(groupsData);
                setAllUsers(usersData);

                if (groupIdFromUrl) {
                    const group = groupsData.find((g) => g._id === groupIdFromUrl);
                    if (group) {
                        setSelectedGroup(group);
                        // Initialize splits for group members
                        setSplits(group.members.map((m) => ({ userId: m._id, amount: '' })));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [groupIdFromUrl]);

    useEffect(() => {
        if (groupId) {
            const group = groups.find((g) => g._id === groupId);
            if (group) {
                setSelectedGroup(group);
                setSplits(group.members.map((m) => ({ userId: m._id, amount: '' })));
            }
        } else {
            setSelectedGroup(null);
            setSplits([]);
        }
    }, [groupId, groups]);

    const handleSplitChange = (userId: string, value: string) => {
        setSplits(splits.map((s) => (s.userId === userId ? { ...s, amount: value } : s)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const amountNum = parseFloat(amount);

            let splitData: { userId: string; amount?: number }[];

            if (splitType === SplitType.EQUAL) {
                splitData = splits.map((s) => ({ userId: s.userId }));
            } else if (splitType === SplitType.EXACT) {
                splitData = splits.map((s) => ({ userId: s.userId, amount: parseFloat(s.amount) || 0 }));
            } else {
                splitData = splits.map((s) => ({ userId: s.userId, amount: parseFloat(s.amount) || 0 }));
            }

            await expenseService.create({
                description,
                amount: amountNum,
                paidBy,
                groupId: groupId || undefined,
                splitType,
                splits: splitData,
            });

            toast.success('Expense added successfully! 💰');
            navigate(groupId ? `/groups/${groupId}` : '/expenses');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add expense');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Calculate total percentage for validation
    const totalPercent = splitType === SplitType.PERCENTAGE
        ? splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
        : 0;
    // Only require percentage validation when we have splits and are in percentage mode
    const isPercentValid = splitType !== SplitType.PERCENTAGE || splits.length === 0 || totalPercent === 100;

    // Calculate total exact amount for validation
    const totalExact = splitType === SplitType.EXACT
        ? splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
        : 0;

    const participants = selectedGroup ? selectedGroup.members : allUsers.slice(0, 10);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '600px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-ghost mb-4 animate-fade-in">
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="card animate-slide-up">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="avatar" style={{ background: 'var(--gradient-accent)' }}>
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Add Expense</h1>
                            <p className="text-sm text-muted">Track what was spent</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Group Selection */}
                        <div className="form-group">
                            <label className="form-label">Group (Optional)</label>
                            <select
                                className="form-input form-select"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                            >
                                <option value="">No group - Personal expense</option>
                                {groups.map((group) => (
                                    <option key={group._id} value={group._id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Dinner, Uber, Movie tickets"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div className="form-group">
                            <label className="form-label">Amount (₹) *</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign
                                    size={18}
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)',
                                    }}
                                />
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="1"
                                    step="1"
                                    style={{ paddingLeft: '44px', fontSize: '1.25rem' }}
                                />
                            </div>
                        </div>

                        {/* Paid By */}
                        <div className="form-group">
                            <label className="form-label">Paid by *</label>
                            <select
                                className="form-input form-select"
                                value={paidBy}
                                onChange={(e) => setPaidBy(e.target.value)}
                                required
                            >
                                {participants.map((member) => (
                                    <option key={member._id} value={member._id}>
                                        {member.name} {member._id === user?._id ? '(You)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Split Type */}
                        <div className="form-group">
                            <label className="form-label">Split Type *</label>
                            <div className="flex gap-2">
                                {Object.values(SplitType).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`btn ${splitType === type ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setSplitType(type)}
                                        style={{ flex: 1 }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Split Details */}
                        {selectedGroup && splits.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">
                                    <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
                                    Split between ({splits.length} members)
                                </label>
                                <div
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem',
                                    }}
                                >
                                    {splits.map((split) => {
                                        const member = selectedGroup.members.find((m) => m._id === split.userId);
                                        if (!member) return null;

                                        return (
                                            <div key={split.userId} className="flex items-center gap-3 mb-3">
                                                <div className="avatar avatar-sm">{getInitials(member.name)}</div>
                                                <span className="flex-1 text-sm">{member.name}</span>
                                                {splitType !== SplitType.EQUAL && (
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        placeholder={splitType === SplitType.PERCENTAGE ? '0%' : '₹0'}
                                                        value={split.amount}
                                                        onChange={(e) => handleSplitChange(split.userId, e.target.value)}
                                                        style={{ width: '100px', padding: '0.5rem' }}
                                                        min="0"
                                                    />
                                                )}
                                                {splitType === SplitType.EQUAL && amount && (
                                                    <span className="text-sm text-muted">
                                                        ₹{Math.round(parseFloat(amount) / splits.length)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Total display for PERCENTAGE */}
                                    {splitType === SplitType.PERCENTAGE && (
                                        <div
                                            className="flex items-center justify-between"
                                            style={{
                                                marginTop: '1rem',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid var(--border)',
                                            }}
                                        >
                                            <span className="font-medium">Total Percentage:</span>
                                            <span
                                                className="font-bold"
                                                style={{
                                                    fontSize: '1.1rem',
                                                    color: totalPercent === 100 ? 'var(--success)' : 'var(--danger)',
                                                }}
                                            >
                                                {totalPercent}%
                                            </span>
                                        </div>
                                    )}
                                    {splitType === SplitType.PERCENTAGE && totalPercent !== 100 && (
                                        <div
                                            style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                background: 'var(--danger-light)',
                                                borderRadius: 'var(--radius-sm)',
                                                color: 'var(--danger)',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            ⚠️ Total must equal 100%. Currently {totalPercent < 100 ? `${100 - totalPercent}% short` : `${totalPercent - 100}% over`}.
                                        </div>
                                    )}

                                    {/* Total display for EXACT */}
                                    {splitType === SplitType.EXACT && amount && (
                                        <div
                                            className="flex items-center justify-between"
                                            style={{
                                                marginTop: '1rem',
                                                paddingTop: '1rem',
                                                borderTop: '1px solid var(--border)',
                                            }}
                                        >
                                            <span className="font-medium">Total Split:</span>
                                            <span
                                                className="font-bold"
                                                style={{
                                                    fontSize: '1.1rem',
                                                    color: totalExact === parseFloat(amount) ? 'var(--success)' : 'var(--danger)',
                                                }}
                                            >
                                                ₹{totalExact} / ₹{amount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !description || !amount || !paidBy || !isPercentValid}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {isLoading ? <div className="spinner" style={{ width: '20px', height: '20px' }} /> : 'Add Expense'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateExpense;
