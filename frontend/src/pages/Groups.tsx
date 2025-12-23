import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupService } from '../services';
import type { Group } from '../types';
import { Users, Plus, ArrowRight, Search } from 'lucide-react';

const Groups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await groupService.getAll();
                setGroups(data);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <h1 className="page-title">Groups</h1>
                        <p className="page-subtitle">Manage your expense sharing groups</p>
                    </div>
                    <Link to="/groups/new" className="btn btn-primary">
                        <Plus size={18} />
                        New Group
                    </Link>
                </div>

                {/* Search */}
                <div className="form-group mb-6 animate-slide-up">
                    <div style={{ position: 'relative' }}>
                        <Search
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
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>
                </div>

                {/* Groups List */}
                {filteredGroups.length === 0 ? (
                    <div className="card empty-state animate-slide-up">
                        <Users size={48} className="empty-state-icon" style={{ margin: '0 auto 1rem' }} />
                        <h3 className="empty-state-title">No groups found</h3>
                        <p className="empty-state-text">
                            {groups.length === 0

                                ? "Create your first group to start splitting expenses with friends!"
                                : "No groups match your search."}
                        </p>
                        {groups.length === 0 && (
                            <Link to="/groups/new" className="btn btn-primary">
                                <Plus size={18} />
                                Create Group
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-2">
                        {filteredGroups.map((group, index) => (
                            <Link
                                key={group._id}
                                to={`/groups/${group._id}`}
                                className="card animate-slide-up"
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    cursor: 'pointer',
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="avatar avatar-lg"
                                        style={{
                                            background: `hsl(${(index * 50) % 360}, 70%, 50%)`,
                                        }}
                                    >
                                        {getInitials(group.name)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">{group.name}</h3>
                                        {group.description && (
                                            <p className="text-sm text-muted mb-2" style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {group.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-primary">
                                                {group.members.length} members
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-muted" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Groups;
