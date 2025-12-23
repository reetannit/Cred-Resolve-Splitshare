import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService, userService } from '../services';
import type { User } from '../types';
import { Users, ArrowLeft, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroup: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await userService.getAll();
                setAllUsers(users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = allUsers.filter(
        (user) =>
            !selectedMembers.some((m) => m._id === user._id) &&
            (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddMember = (user: User) => {
        setSelectedMembers([...selectedMembers, user]);
        setSearchQuery('');
    };

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter((m) => m._id !== userId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const group = await groupService.create({
                name,
                description: description || undefined,
                memberIds: selectedMembers.map((m) => m._id),
            });
            toast.success('Group created successfully! 🎉');
            navigate(`/groups/${group._id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create group');
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

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '600px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-ghost mb-4 animate-fade-in"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="card animate-slide-up">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="avatar" style={{ background: 'var(--gradient-primary)' }}>
                            <Users size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Create New Group</h1>
                            <p className="text-sm text-muted">Split expenses with friends and family</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Group Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Trip to Goa, Roommates"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="form-input"
                                placeholder="What's this group for?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <UserPlus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                                Add Members
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* Search Results */}
                            {searchQuery && filteredUsers.length > 0 && (
                                <div
                                    className="mt-2"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        maxHeight: '200px',
                                        overflow: 'auto',
                                    }}
                                >
                                    {filteredUsers.slice(0, 5).map((user) => (
                                        <button
                                            key={user._id}
                                            type="button"
                                            onClick={() => handleAddMember(user)}
                                            className="flex items-center gap-3 p-3 w-full text-left"
                                            style={{
                                                borderBottom: '1px solid var(--border)',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div className="avatar avatar-sm">{getInitials(user.name)}</div>
                                            <div>
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-muted">{user.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Members */}
                        {selectedMembers.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Selected Members ({selectedMembers.length})</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMembers.map((member) => (
                                        <div
                                            key={member._id}
                                            className="flex items-center gap-2 px-3 py-2"
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '9999px',
                                            }}
                                        >
                                            <div className="avatar avatar-sm" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                                                {getInitials(member.name)}
                                            </div>
                                            <span className="text-sm">{member.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(member._id)}
                                                className="text-muted"
                                                style={{ display: 'flex' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading || !name.trim()}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {isLoading ? <div className="spinner" style={{ width: '20px', height: '20px' }} /> : 'Create Group'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
