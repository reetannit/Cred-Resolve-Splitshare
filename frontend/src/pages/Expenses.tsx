import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { expenseService } from '../services';
import type { Expense } from '../types';
import { Receipt, Plus, Filter } from 'lucide-react';

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await expenseService.getAll(undefined, page, 15);
                setExpenses(data.data || []);
                setTotalPages(data.pages || 1);
            } catch (error) {
                console.error('Failed to fetch expenses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpenses();
    }, [page]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
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
                <div className="flex items-center justify-between mb-6 animate-fade-in">
                    <div>
                        <h1 className="page-title">Expenses</h1>
                        <p className="page-subtitle">All your shared expenses</p>
                    </div>
                    <Link to="/expenses/new" className="btn btn-primary">
                        <Plus size={18} />
                        Add Expense
                    </Link>
                </div>

                {expenses.length === 0 ? (
                    <div className="card empty-state animate-slide-up">
                        <Receipt size={48} className="empty-state-icon" style={{ margin: '0 auto 1rem' }} />
                        <h3 className="empty-state-title">No expenses yet</h3>
                        <p className="empty-state-text">Start tracking your shared expenses</p>
                        <Link to="/expenses/new" className="btn btn-primary">
                            <Plus size={18} />
                            Add Expense
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="card animate-slide-up">
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
                                        <div className="avatar" style={{ background: 'var(--gradient-accent)' }}>
                                            <Receipt size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold">{expense.description}</p>
                                            <p className="text-sm text-muted">
                                                Paid by <span className="text-primary">{expense.paidBy.name}</span>
                                                {expense.group && (
                                                    <> • <Link to={`/groups/${expense.group._id}`} className="text-secondary">{expense.group.name}</Link></>
                                                )}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-primary">{expense.splitType}</span>
                                                <span className="text-xs text-muted">{formatDate(expense.createdAt)}</span>
                                            </div>
                                        </div>
                                        <p className="text-xl font-bold">{formatCurrency(expense.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6 animate-slide-up">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn btn-secondary"
                                >
                                    Previous
                                </button>
                                <span className="btn btn-ghost" style={{ pointerEvents: 'none' }}>
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn btn-secondary"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Expenses;
