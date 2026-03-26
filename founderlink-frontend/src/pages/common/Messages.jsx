import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, ChevronRight, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import useAuth from '../../hooks/useAuth';
import { getMyConversations, startConversation } from '../../api/messagingApi';
import { getAuthUserById, getUsersByRole } from '../../api/userApi';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [userMap, setUserMap]             = useState({});
  const [loading, setLoading]             = useState(true);
  // People this user can message
  const [messageable, setMessageable]     = useState([]);
  const [search, setSearch]               = useState('');
  const [showDropdown, setShowDropdown]   = useState(false);
  const navigate = useNavigate();
  const { userId, isFounder, isInvestor, isCoFounder } = useAuth();

  // Load conversations + messageable users together, then build userMap from auth data
  useEffect(() => {
    if (!userId) return;
    const rolesToFetch = isFounder
      ? ['ROLE_INVESTOR', 'ROLE_COFOUNDER']
      : isInvestor
      ? ['ROLE_FOUNDER']
      : isCoFounder
      ? ['ROLE_FOUNDER']
      : [];

    Promise.all([
      getMyConversations().then(res => res.data?.data || []).catch(() => []),
      ...rolesToFetch.map(r => getUsersByRole(r).then(res => res.data || []).catch(() => [])),
    ]).then(([convos, ...userArrays]) => {
      setConversations(convos);

      const allUsers = userArrays.flat().filter(u => u.userId !== userId);
      setMessageable(allUsers);

      // Build userMap from auth-service data (always has name/email, no profile needed)
      const map = {};
      allUsers.forEach(u => { map[u.userId] = u; });

      // For conversation participants not covered by messageable, fetch from user-service
      const coveredIds = new Set(allUsers.map(u => u.userId));
      const extraIds = [...new Set(
        convos.map(c => c.participant1Id === userId ? c.participant2Id : c.participant1Id)
      )].filter(id => !coveredIds.has(id));

      if (extraIds.length > 0) {
        Promise.all(extraIds.map(id => getAuthUserById(id).then(r => [id, r.data]).catch(() => [id, null])))
          .then(entries => {
            entries.forEach(([id, data]) => { if (data) map[id] = data; });
            setUserMap({ ...map });
          });
      } else {
        setUserMap(map);
      }
    })
    .catch(() => toast.error('Failed to load conversations'))
    .finally(() => setLoading(false));
  }, [userId, isFounder, isInvestor, isCoFounder]);

  const filtered = search.trim().length > 0
    ? messageable.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelectUser = async (user) => {
    setSearch('');
    setShowDropdown(false);
    try {
      const res = await startConversation(user.userId);
      const conv = res.data?.data;
      navigate(`/messages/${conv.id}`, { state: { otherUserId: user.userId } });
    } catch { toast.error('Failed to start conversation'); }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={22} className="text-accent-light" /> Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">Direct conversations with other users</p>
        </div>

        {/* New conversation */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-accent-light" /> New Conversation
          </h2>
          <div className="relative">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                className="input-field pl-9 w-full"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
            </div>
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-dark-700 border border-dark-400 rounded-xl shadow-lg overflow-hidden">
                {filtered.slice(0, 8).map(u => (
                  <button
                    key={u.userId}
                    onMouseDown={() => handleSelectUser(u)}
                    className="w-full text-left px-4 py-3 hover:bg-dark-600 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-accent-light text-xs font-bold">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-200 text-sm font-medium">{u.name || u.email}</p>
                      <p className="text-gray-500 text-xs">{u.email} · {u.role?.replace('ROLE_', '')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && search.trim().length > 0 && filtered.length === 0 && (
              <div className="absolute z-20 w-full mt-1 bg-dark-700 border border-dark-400 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-sm">No users found matching "{search}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversations list */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Conversations</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No conversations yet.</p>
              <p className="text-gray-600 text-sm">Search for someone above to start chatting.</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-500">
              {conversations.map(c => {
                const otherId = c.participant1Id === userId ? c.participant2Id : c.participant1Id;
                return (
                  <div
                    key={c.id}
                    className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-dark-700 rounded-lg px-3 -mx-3 transition-colors group"
                    onClick={() => navigate(`/messages/${c.id}`, { state: { otherUserId: otherId } })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-dark-600 border border-dark-400 flex items-center justify-center">
                        <MessageSquare size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">
                          {userMap[otherId]?.name || userMap[otherId]?.email || `User #${otherId}`}
                        </p>
                        <p className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
