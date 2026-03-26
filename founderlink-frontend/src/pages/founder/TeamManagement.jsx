import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Search, UserPlus, Users, User, CheckCircle,
  Briefcase, X, ChevronDown, Filter, Pencil, Check
} from 'lucide-react';
import Layout from '../../components/Layout';
import { getCoFounderIds, getProfilesBatch, getAuthUserById } from '../../api/userApi';
import { getTeamByStartup, inviteCoFounder, updateMemberRole } from '../../api/teamApi';

// Roles available for updating existing members (includes CO_FOUNDER)
const UPDATE_ROLES = [
  { value: 'CO_FOUNDER',      label: 'Co-Founder' },
  { value: 'CTO',             label: 'CTO' },
  { value: 'CPO',             label: 'CPO' },
  { value: 'MARKETING_HEAD',  label: 'Marketing Head' },
  { value: 'ENGINEERING_LEAD', label: 'Engineering Lead' },
];

// Roles available for invitation — FOUNDER and CO_FOUNDER excluded
const INVITE_ROLES = [
  { value: 'CTO',              label: 'CTO – Chief Technology Officer' },
  { value: 'CPO',              label: 'CPO – Chief Product Officer' },
  { value: 'MARKETING_HEAD',   label: 'Marketing Head' },
  { value: 'ENGINEERING_LEAD', label: 'Engineering Lead' },
];

const ROLE_BADGE = {
  FOUNDER:         'badge-purple',
  CO_FOUNDER:      'badge-purple',
  CTO:             'badge-blue',
  CPO:             'badge-blue',
  MARKETING_HEAD:  'badge-green',
  ENGINEERING_LEAD:'badge-yellow',
};

const ROLE_LABEL = {
  FOUNDER:         'Founder',
  CO_FOUNDER:      'Co-Founder',
  CTO:             'CTO',
  CPO:             'CPO',
  MARKETING_HEAD:  'Marketing Head',
  ENGINEERING_LEAD:'Engineering Lead',
};

// Merge AuthService summary (userId, name, email) with UserService profile (skills, bio, experience)
// Profile data is the source of truth for name/email if available
function mergeUserData(authSummaries, profiles) {
  const profileMap = {};
  profiles.forEach(p => { profileMap[p.userId] = p; });

  return authSummaries.map(auth => {
    const profile = profileMap[auth.userId] || {};
    return {
      userId:       auth.userId,
      name:         profile.name  || auth.name,
      email:        profile.email || auth.email,
      bio:          profile.bio,
      skills:       profile.skills,
      experience:   profile.experience,
      hasProfile:   !!profile.userId,
    };
  });
}

export default function TeamManagement() {
  const { startupId } = useParams();

  // ── Search state ──────────────────────────────────────────────────────────
  const [skillInput, setSkillInput]     = useState('');
  const [searchMode, setSearchMode]     = useState('role'); // 'role' | 'role+skill'
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [searched, setSearched]         = useState(false);

  // ── Selection & invite state ──────────────────────────────────────────────
  const [selected, setSelected]         = useState(null);
  const [selectedRole, setSelectedRole] = useState('CTO');
  const [inviting, setInviting]         = useState(false);

  // ── Team members ──────────────────────────────────────────────────────────
  const [members, setMembers]           = useState([]);
  const [memberProfiles, setMemberProfiles] = useState({}); // userId → {name, email}
  const [loadingTeam, setLoadingTeam]   = useState(true);

  // ── Role editing ──────────────────────────────────────────────────────────
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingRole, setEditingRole]         = useState('');
  const [updatingRole, setUpdatingRole]       = useState(false);

  const loadTeam = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const res = await getTeamByStartup(startupId);
      const teamMembers = res.data || [];
      setMembers(teamMembers);

      // Fetch names for all team members
      if (teamMembers.length > 0) {
        const ids = teamMembers.map(m => m.userId);
        const profileMap = {};

        // Fetch auth-service summaries (always has name/email from registration)
        const authResults = await Promise.allSettled(ids.map(id => getAuthUserById(id)));
        authResults.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            const u = result.value.data;
            profileMap[ids[i]] = { userId: u.userId, name: u.name, email: u.email };
          }
        });

        // Overlay user-service profiles (richer data: skills, bio, etc.)
        try {
          const profileRes = await getProfilesBatch(ids, '');
          (profileRes.data || []).forEach(p => {
            profileMap[p.userId] = { ...profileMap[p.userId], ...p };
          });
        } catch {
          // user-service profiles optional — auth names already in map
        }

        setMemberProfiles(profileMap);
      }
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoadingTeam(false);
    }
  }, [startupId]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (searchMode === 'role+skill' && !skillInput.trim()) {
      toast.error('Please enter a skill to search with');
      return;
    }

    setSearching(true);
    setSearched(false);
    setSelected(null);

    try {
      // Step 1: Get all co-founder user IDs + basic info from AuthService
      const authRes = await getCoFounderIds();
      const coFounders = authRes.data || []; // [{userId, name, email, role}]

      if (coFounders.length === 0) {
        setSearchResults([]);
        setSearched(true);
        return;
      }

      const allIds = coFounders.map(u => u.userId);

      // Step 2: Get profiles from UserService (with optional skill filter)
      const skill = searchMode === 'role+skill' ? skillInput.trim() : '';
      const profileRes = await getProfilesBatch(allIds, skill);
      const profiles = profileRes.data || [];

      // Step 3: For role-only search: show all co-founders (merge with available profiles)
      //         For role+skill: only show those whose profile matched the skill filter
      let merged;
      if (searchMode === 'role') {
        merged = mergeUserData(coFounders, profiles);
      } else {
        // Only show users who have a profile with matching skill
        const matchedIds = new Set(profiles.map(p => p.userId));
        const matchedAuth = coFounders.filter(u => matchedIds.has(u.userId));
        merged = mergeUserData(matchedAuth, profiles);
      }

      setSearchResults(merged);
      setSearched(true);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSkillInput('');
    setSearchResults([]);
    setSearched(false);
    setSelected(null);
  };

  // ── Select user ───────────────────────────────────────────────────────────
  const handleSelect = (user) => {
    if (alreadyOnTeam(user.userId)) return;
    setSelected(prev => (prev?.userId === user.userId ? null : user));
    setSelectedRole('CTO');
  };

  // ── Invite ────────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!selected) return;
    if (alreadyOnTeam(selected.userId)) {
      toast.error(`${selected.name} is already on the team.`);
      return;
    }

    setInviting(true);
    try {
      await inviteCoFounder({
        startupId:     parseInt(startupId),
        invitedUserId: selected.userId,
        role:          selectedRole,
      });
      toast.success(`Invite sent to ${selected.name} as ${ROLE_LABEL[selectedRole]}!`);
      setSelected(null);
      setSearchResults([]);
      setSearched(false);
      setSkillInput('');
      loadTeam(); // Refresh team — founder will now appear
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  const parseSkills = (skills) =>
    skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  const alreadyOnTeam = (userId) => members.some(m => m.userId === userId);

  const startEditRole = (member) => {
    setEditingMemberId(member.id);
    setEditingRole(member.role);
  };

  const cancelEditRole = () => {
    setEditingMemberId(null);
    setEditingRole('');
  };

  const handleRoleUpdate = async (memberId) => {
    setUpdatingRole(true);
    try {
      await updateMemberRole(memberId, { role: editingRole });
      toast.success('Role updated successfully');
      setEditingMemberId(null);
      setEditingRole('');
      loadTeam();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-accent-light" /> Team Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Find co-founders by role or by role + skill, then invite them with a specific position.
          </p>
        </div>

        {/* ── Search Section ────────────────────────────────────────────── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Search size={16} className="text-accent-light" /> Find Co-Founders
          </h2>

          {/* Search mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setSearchMode('role'); handleClear(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                searchMode === 'role'
                  ? 'bg-accent text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Users size={13} /> By Role Only
            </button>
            <button
              onClick={() => { setSearchMode('role+skill'); handleClear(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                searchMode === 'role+skill'
                  ? 'bg-accent text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Filter size={13} /> Role + Skill
            </button>
          </div>

          {/* Skill input (only for role+skill mode) */}
          {searchMode === 'role+skill' && (
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className="input-field pl-9 pr-8 w-full"
                placeholder="e.g. React, Java, Marketing, Finance..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              {skillInput && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary flex items-center gap-2"
          >
            {searching
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Search size={15} />
            }
            {searching ? 'Searching...' : 'Search Co-Founders'}
          </button>

          {/* Results */}
          {searched && (
            <div>
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchMode === 'role+skill'
                    ? `No co-founders found with skill matching "${skillInput}".`
                    : 'No co-founders registered in the system yet.'}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-3">
                    {searchResults.length} co-founder{searchResults.length !== 1 ? 's' : ''} found —
                    click a person to select
                  </p>

                  {searchResults.map(user => {
                    const isSelected  = selected?.userId === user.userId;
                    const isMember    = alreadyOnTeam(user.userId);

                    return (
                      <div
                        key={user.userId}
                        onClick={() => handleSelect(user)}
                        className={`
                          rounded-xl border p-4 transition-all
                          ${isMember
                            ? 'border-dark-500 bg-dark-700 opacity-50 cursor-not-allowed'
                            : isSelected
                              ? 'border-accent bg-accent/10 cursor-pointer ring-1 ring-accent/40'
                              : 'border-dark-500 bg-dark-700 hover:border-dark-300 cursor-pointer'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-accent/20 border border-accent/40' : 'bg-dark-600 border border-dark-400'
                          }`}>
                            {isSelected
                              ? <CheckCircle size={18} className="text-accent-light" />
                              : <User size={16} className="text-gray-400" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-white">{user.name}</p>
                              {isMember && <span className="badge-green text-xs">Already in team</span>}
                              {!user.hasProfile && (
                                <span className="text-xs text-gray-600 italic">No profile yet</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>

                            {user.bio && (
                              <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">{user.bio}</p>
                            )}

                            {user.skills && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {parseSkills(user.skills).map(skill => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 rounded-md bg-dark-500 text-gray-300 text-xs border border-dark-400"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {user.experience && (
                              <p className="text-gray-600 text-xs mt-1.5 flex items-center gap-1">
                                <Briefcase size={10} /> {user.experience}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Invite Panel ─────────────────────────────────────────────── */}
        {selected && (
          <div className="card border-accent/30 bg-accent/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <UserPlus size={16} className="text-accent-light" />
                Invite <span className="text-accent-light">{selected.name}</span>
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 p-1">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1.5 block">Assign Role</label>
                <div className="relative">
                  <select
                    className="input-field w-full appearance-none pr-8"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                  >
                    {INVITE_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleInvite}
                disabled={inviting}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                {inviting
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <UserPlus size={15} />
                }
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        )}

        {/* ── Current Team Members ─────────────────────────────────────── */}
        <div className="card">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Users size={17} className="text-accent-light" /> Current Team
            {members.length > 0 && <span className="badge-blue ml-1">{members.length}</span>}
          </h2>

          {loadingTeam ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-14 bg-dark-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No team members yet.</p>
              <p className="text-gray-600 text-sm">Send an invite above — you'll be added automatically.</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-500">
              {members.map(m => {
                const profile = memberProfiles[m.userId];
                const displayName = profile?.name || `User #${m.userId}`;
                const displayEmail = profile?.email;
                const isEditing = editingMemberId === m.id;
                return (
                  <div key={m.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${
                        m.role === 'FOUNDER'
                          ? 'bg-accent/15 border-accent/30'
                          : 'bg-dark-600 border-dark-400'
                      }`}>
                        <User size={15} className={m.role === 'FOUNDER' ? 'text-accent-light' : 'text-gray-400'} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-200">{displayName}</p>
                        <p className="text-gray-500 text-xs">
                          {displayEmail && <span className="mr-2">{displayEmail}</span>}
                          Joined {new Date(m.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <div className="relative">
                            <select
                              className="input-field text-sm py-1 pr-7 appearance-none"
                              value={editingRole}
                              onChange={e => setEditingRole(e.target.value)}
                              disabled={updatingRole}
                            >
                              {UPDATE_ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => handleRoleUpdate(m.id)}
                            disabled={updatingRole}
                            className="p-1.5 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-colors"
                            title="Save"
                          >
                            {updatingRole
                              ? <span className="w-3.5 h-3.5 border-2 border-accent-light/30 border-t-accent-light rounded-full animate-spin block" />
                              : <Check size={14} />
                            }
                          </button>
                          <button
                            onClick={cancelEditRole}
                            disabled={updatingRole}
                            className="p-1.5 rounded-lg bg-dark-600 text-gray-400 hover:text-gray-200 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={ROLE_BADGE[m.role] || 'badge-blue'}>
                            {ROLE_LABEL[m.role] || m.role}
                          </span>
                          {m.role !== 'FOUNDER' && (
                            <button
                              onClick={() => startEditRole(m)}
                              className="p-1.5 rounded-lg bg-dark-600 text-gray-500 hover:text-gray-200 hover:bg-dark-500 transition-colors"
                              title="Change role"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
