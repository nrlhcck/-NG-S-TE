import React, { useState, useEffect } from 'react';
import { User, Friend, SchoolType } from '../types';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  writeBatch, 
  query,
  limit,
  getDocs
} from 'firebase/firestore';
import {
  Award,
  ChevronRight,
  Flame,
  Plus,
  Search,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
  Loader2,
  Trash2,
  ThumbsUp
} from 'lucide-react';

interface FriendsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function Friends({ user, onUpdateUser }: FriendsProps) {
  // Real-time collections in state
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Input fields for searching
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [searchSuccess, setSearchSuccess] = useState<string>('');

  // Manual configuration classmates
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newFriendUsername, setNewFriendUsername] = useState<string>('');
  const [creatingClassmate, setCreatingClassmate] = useState<boolean>(false);

  // Left-pane comparison state switcher
  const [compareFriendId, setCompareFriendId] = useState<string>('');

  // Subscribe to real-time firestore friends subcollection
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Offline mode: initialize local friend registry
      const localFriendsStr = localStorage.getItem('local_friends');
      let localFriends: Friend[] = [];
      if (!localFriendsStr) {
        // Pre-seed some default warm buddy connections to make Friends Arena look gorgeous immediately
        localFriends = [
          {
            friendId: 'mock_james',
            username: 'james_adventurer',
            name: 'James Carter',
            avatar: '🦁',
            xp: 2900,
            schoolType: 'Middle School',
            grade: 6,
            status: 'accepted',
            updatedAt: new Date().toISOString()
          },
          {
            friendId: 'mock_sarah',
            username: 'sarah_quest',
            name: 'Sarah Connor',
            avatar: '🦊',
            xp: 2450,
            schoolType: 'High School',
            grade: 10,
            status: 'accepted',
            updatedAt: new Date().toISOString()
          },
          {
            friendId: 'mock_ali',
            username: 'ali_quest',
            name: 'Ali Yildiz',
            avatar: '🐼',
            xp: 1850,
            schoolType: 'Middle School',
            grade: 5,
            status: 'accepted',
            updatedAt: new Date().toISOString()
          },
          {
            friendId: 'mock_zeynep',
            username: 'zeynep_12',
            name: 'Zeynep Demir',
            avatar: '🐯',
            xp: 1320,
            schoolType: 'Middle School',
            grade: 5,
            status: 'request_received', // Incoming friend request
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('local_friends', JSON.stringify(localFriends));
      } else {
        localFriends = JSON.parse(localFriendsStr);
      }
      setFriendsList(localFriends);
      setLoading(false);

      // Pre-seed mock directory registry so they can look up other mock students!
      const mockUsersStr = localStorage.getItem('mock_users');
      if (!mockUsersStr) {
        const mockUsers = {
          'james@quest.com': { password: 'password', user: { id: 'mock_james', username: 'james_adventurer', name: 'James Carter', avatar: '🦁', xp: 2900, schoolType: 'Middle School', grade: 6 } },
          'sarah@quest.com': { password: 'password', user: { id: 'mock_sarah', username: 'sarah_quest', name: 'Sarah Connor', avatar: '🦊', xp: 2450, schoolType: 'High School', grade: 10 } },
          'ali@quest.com': { password: 'password', user: { id: 'mock_ali', username: 'ali_quest', name: 'Ali Yildiz', avatar: '🐼', xp: 1850, schoolType: 'Middle School', grade: 5 } },
          'zeynep@quest.com': { password: 'password', user: { id: 'mock_zeynep', username: 'zeynep_12', name: 'Zeynep Demir', avatar: '🐯', xp: 1320, schoolType: 'Middle School', grade: 5 } },
          'clara@quest.com': { password: 'password', user: { id: 'mock_clara', username: 'clara_edu', name: 'Clara Oswald', avatar: '🦄', xp: 3200, schoolType: 'High School', grade: 11 } }
        };
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      return;
    }

    const friendsRef = collection(db, 'users', user.id, 'friends');
    
    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const friends: Friend[] = [];
      snapshot.forEach((docSnap) => {
        friends.push(docSnap.data() as Friend);
      });
      setFriendsList(friends);
      setLoading(false);
    }, (error) => {
      console.error("Friends fetch error:", error);
      handleFirestoreError(error, OperationType.LIST, `users/${user.id}/friends`);
      setLoading(false);
    });

    return unsubscribe;
  }, [user.id]);

  // If no comparison selection, match initial if any
  const acceptedFriends = friendsList.filter(f => f.status === 'accepted');
  useEffect(() => {
    if (!compareFriendId && acceptedFriends.length > 0) {
      setCompareFriendId(acceptedFriends[0].friendId);
    }
  }, [acceptedFriends, compareFriendId]);

  // Search username to add
  const handleSearchFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchSuccess('');
    setSearchResult(null);

    const cleanName = searchUsername.trim().toLowerCase();
    if (!cleanName) return;

    if (cleanName === user.username.toLowerCase()) {
      setSearchError("You cannot send a friend request to yourself.");
      return;
    }

    // Check if already friends
    const alreadyStatus = friendsList.find(f => f.username.toLowerCase() === cleanName);
    if (alreadyStatus) {
      setSearchError(`You already have a relationship status with @${cleanName} (${alreadyStatus.status}).`);
      return;
    }

    if (!isFirebaseConfigured) {
      setSearching(true);
      setTimeout(() => {
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '{}');
        const matchEntry = Object.values(mockUsers).find((entry: any) => entry.user?.username?.toLowerCase() === cleanName);
        if (matchEntry) {
          const matchUser = (matchEntry as any).user;
          setSearchResult({
            id: matchUser.id,
            username: matchUser.username,
            name: matchUser.name,
            avatar: matchUser.avatar,
            schoolType: matchUser.schoolType,
            grade: matchUser.grade,
            xp: matchUser.xp
          });
        } else {
          setSearchError(`No student registered with username @${cleanName} in local directory.`);
        }
        setSearching(false);
      }, 300);
      return;
    }

    setSearching(true);
    try {
      // 1. Verify existence in unique username registry
      const usernameRef = doc(db, 'usernames', cleanName);
      const usernameSnap = await getDoc(usernameRef);

      if (!usernameSnap.exists()) {
        setSearchError(`No student registered with username @${cleanName}. Double check spelling!`);
        setSearching(false);
        return;
      }

      const targetUid = usernameSnap.data().userId;

      // 2. Query target profile
      const targetDocRef = doc(db, 'users', targetUid);
      const targetDoc = await getDoc(targetDocRef);

      if (!targetDoc.exists()) {
        setSearchError("The student profile details could not be parsed.");
        setSearching(false);
        return;
      }

      const targetData = targetDoc.data() as User;
      setSearchResult({
        id: targetUid,
        username: targetData.username,
        name: targetData.name,
        avatar: targetData.avatar,
        schoolType: targetData.schoolType,
        grade: targetData.grade,
        xp: targetData.xp
      });
    } catch (err) {
      console.error(err);
      setSearchError("An error occurred during directory lookup.");
    } finally {
      setSearching(false);
    }
  };

  // Dispatch atomic transactions to send request
  const handleSendRequest = async (target: any) => {
    setSearching(true);
    setSearchError('');
    setSearchSuccess('');

    if (!isFirebaseConfigured) {
      setTimeout(() => {
        const localFriendsStr = localStorage.getItem('local_friends') || '[]';
        const localFriends: Friend[] = JSON.parse(localFriendsStr);
        const newFriend: Friend = {
          friendId: target.id,
          username: target.username,
          name: target.name,
          avatar: target.avatar,
          xp: target.xp,
          schoolType: target.schoolType as SchoolType,
          grade: target.grade,
          status: 'request_sent',
          updatedAt: new Date().toISOString()
        };
        const updated = [...localFriends.filter(f => f.friendId !== target.id), newFriend];
        localStorage.setItem('local_friends', JSON.stringify(updated));
        setFriendsList(updated);
        setSearchSuccess(`Friend request successfully simulated to @${target.username}!`);
        setSearchResult(null);
        setSearchUsername('');
        setSearching(false);
      }, 400);
      return;
    }

    try {
      const batch = writeBatch(db);

      // A. Write "request_sent" inside sender's registry
      const senderRef = doc(db, 'users', user.id, 'friends', target.id);
      const senderPayload: Friend = {
        friendId: target.id,
        username: target.username,
        name: target.name,
        avatar: target.avatar,
        xp: target.xp,
        schoolType: target.schoolType as SchoolType,
        grade: target.grade,
        status: 'request_sent',
        updatedAt: new Date().toISOString()
      };
      batch.set(senderRef, senderPayload);

      // B. Write "request_received" to target user's registry
      const targetRef = doc(db, 'users', target.id, 'friends', user.id);
      const targetPayload: Friend = {
        friendId: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        xp: user.xp,
        schoolType: user.schoolType,
        grade: user.grade,
        status: 'request_received',
        updatedAt: new Date().toISOString()
      };
      batch.set(targetRef, targetPayload);

      await batch.commit();

      setSearchSuccess(`Friend request successfully sent to @${target.username}!`);
      setSearchResult(null);
      setSearchUsername('');
    } catch (err) {
      console.error(err);
      setSearchError("Could not dispatch friend request.");
    } finally {
      setSearching(false);
    }
  };

  // Accept request (bilateral 'accepted' flag)
  const handleAcceptRequest = async (friend: Friend) => {
    if (!isFirebaseConfigured) {
      const localFriendsStr = localStorage.getItem('local_friends') || '[]';
      const localFriends: Friend[] = JSON.parse(localFriendsStr);
      const updated = localFriends.map(f => {
        if (f.friendId === friend.friendId) {
          return { ...f, status: 'accepted' as const, updatedAt: new Date().toISOString() };
        }
        return f;
      });
      localStorage.setItem('local_friends', JSON.stringify(updated));
      setFriendsList(updated);
      return;
    }

    try {
      const batch = writeBatch(db);

      const selfRef = doc(db, 'users', user.id, 'friends', friend.friendId);
      batch.update(selfRef, {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });

      const peerRef = doc(db, 'users', friend.friendId, 'friends', user.id);
      batch.update(peerRef, {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
    } catch (err) {
      console.error("Accepting error:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}/friends/${friend.friendId}`);
    }
  };

  // Decline/Remove relationship
  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;

    if (!isFirebaseConfigured) {
      const localFriendsStr = localStorage.getItem('local_friends') || '[]';
      const localFriends: Friend[] = JSON.parse(localFriendsStr);
      const updated = localFriends.filter(f => f.friendId !== friendId);
      localStorage.setItem('local_friends', JSON.stringify(updated));
      setFriendsList(updated);
      if (compareFriendId === friendId) {
        setCompareFriendId('');
      }
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', user.id, 'friends', friendId));
      batch.delete(doc(db, 'users', friendId, 'friends', user.id));
      await batch.commit();
      
      if (compareFriendId === friendId) {
        setCompareFriendId('');
      }
    } catch (err) {
      console.error("Removal error:", err);
    }
  };

  // Companion seeded suggestions list
  const incomingRequests = friendsList.filter(f => f.status === 'request_received');
  const sentRequests = friendsList.filter(f => f.status === 'request_sent');

  // Unified Leaderboard calculations (Current user + accepted friends)
  const selfHours = parseFloat(((user.studyLogs?.reduce((acc, curr) => acc + curr.minutes, 0) || 30) / 60).toFixed(1));
  const leaderboardEntries = [
    {
      id: user.id,
      name: `${user.name} (You)`,
      username: user.username,
      avatar: user.avatar,
      xp: user.xp,
      hours: selfHours,
      isSelf: true
    },
    ...acceptedFriends.map(f => ({
      id: f.friendId,
      name: f.name,
      username: f.username,
      avatar: f.avatar,
      xp: f.xp,
      hours: parseFloat(((f.xp % 450) / 65 + 4).toFixed(1)), // Proportional hours
      isSelf: false
    }))
  ].sort((a, b) => b.xp - a.xp);

  // Active comparator calculations
  const activeCompareFriend = acceptedFriends.find(f => f.friendId === compareFriendId);

  const getComparisonAdvice = () => {
    if (!activeCompareFriend) return '';
    const xpDiff = user.xp - activeCompareFriend.xp;
    
    if (xpDiff > 0) {
      return `🎉 Brilliant! You lead @${activeCompareFriend.username} by ${xpDiff} XP. Keep up your study habits to maintain your rank!`;
    } else if (xpDiff < 0) {
      return `🔥 Steady! @${activeCompareFriend.username} is ${Math.abs(xpDiff)} XP ahead of you. Solve some quizzes or complete high-reward lessons in the chapters to close the gap!`;
    }
    return `🤝 Spectacular! You and @${activeCompareFriend.username} are exactly tied in experience points. A truly noble duel!`;
  };

  const renderAvatar = (avString: string) => {
    const avatarToRender = avString || '🎒';
    if (avatarToRender.startsWith('http://') || avatarToRender.startsWith('https://') || avatarToRender.includes('/') || avatarToRender.includes('.')) {
      return (
        <img 
          src={avatarToRender} 
          alt="Friend avatar" 
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover rounded-full" 
        />
      );
    }
    return <span className="text-xl select-none">{avatarToRender}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-750 text-left">
      
      {/* 1. TOP TITLE BANNER CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Users className="h-7 w-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-extrabold text-slate-800 tracking-tight">Friends & Comparisons</h2>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">
              Connect with real classmates, approve requests, and compete on the weekly XP rankings
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 outline-none"
        >
          <Plus className="h-4 w-4" />
          Search Friends Directory
        </button>
      </div>

      {/* DOCK DIRECTORY SEARCH SECTION */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border-2 border-indigo-100 p-6 shadow-sm animate-fade-in space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="h-4 w-4 text-indigo-500" />
              Add Student by Username
            </h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSearchFriend} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="Enter student username (e.g. zeynep_12)"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              {searching ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Check Username"}
            </button>
          </form>

          {/* Directory messages */}
          {searchError && <p className="text-xs text-rose-500 font-bold">⚠️ {searchError}</p>}
          {searchSuccess && <p className="text-xs text-emerald-500 font-bold">✓ {searchSuccess}</p>}

          {/* Search result card */}
          {searchResult && (
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl max-w-sm flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white border border-slate-200 flex items-center justify-center rounded-xl overflow-hidden shadow-inner">
                  {renderAvatar(searchResult.avatar)}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-850">{searchResult.name}</h5>
                  <p className="text-[10px] text-slate-400 font-bold lowercase">@{searchResult.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSendRequest(searchResult)}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-550 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
              >
                <UserCheck className="h-3 w-3" /> Send Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. MAIN LAYOUT COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: REQUESTS & LISTS */}
        <div className="space-y-6">
          
          {/* Incoming requests (interactive accept) */}
          {incomingRequests.length > 0 && (
            <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-3xl p-5 shadow-inner space-y-3">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-amber-500" />
                Requests Received ({incomingRequests.length})
              </h4>
              <div className="space-y-2">
                {incomingRequests.map((fr) => (
                  <div key={fr.friendId} className="p-3 bg-white border border-amber-200/65 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 bg-slate-50 border border-slate-200 flex items-center justify-center rounded-lg overflow-hidden">
                        {renderAvatar(fr.avatar)}
                      </div>
                      <div>
                        <h5 className="font-bold text-[11px] text-slate-800">{fr.name}</h5>
                        <p className="text-[9px] text-slate-400 tracking-wider">@{fr.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleAcceptRequest(fr)}
                        className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-lg transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(fr.friendId)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active accepted friends column list */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Connected Classmates ({acceptedFriends.length})</h4>
            
            {loading ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              </div>
            ) : acceptedFriends.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <Users className="h-8 w-8 mx-auto text-slate-250" />
                <p className="font-semibold text-xs uppercase tracking-wider">No active linkages yet</p>
                <p className="text-[11px] max-w-[200px] mx-auto text-slate-400 leading-normal font-medium">
                  Search directory above to send classmate linkages, or connect with your email to link profiles!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {acceptedFriends.map((fr) => (
                  <button
                    key={fr.friendId}
                    onClick={() => setCompareFriendId(fr.friendId)}
                    className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between outline-none ${
                      compareFriendId === fr.friendId
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-10 w-10 bg-white border border-slate-200/55 rounded-xl flex items-center justify-center overflow-hidden">
                        {renderAvatar(fr.avatar)}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs">{fr.name}</h5>
                        <p className="text-[10px] opacity-70 mt-0.5">{fr.schoolType} • Grade {fr.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-400">
                        {fr.xp} XP
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(fr.friendId);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          compareFriendId === fr.friendId ? 'text-slate-400 hover:text-rose-450' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Remove Friend"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pending sent requests tracker */}
          {sentRequests.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Confirmation ({sentRequests.length})</h4>
              <div className="space-y-2">
                {sentRequests.map((fr) => (
                  <div key={fr.friendId} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{fr.avatar}</span>
                      <div>
                        <h5 className="font-bold text-[11px] text-slate-700">{fr.name}</h5>
                        <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">@{fr.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(fr.friendId)}
                      className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-450 hover:text-rose-600 text-[10px] font-bold rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REVIEWS & LEADERBOARDS (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Side-by-side diagnostic profile comparator */}
          {activeCompareFriend ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-5 animate-fade-in text-left">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h4 className="text-base font-extrabold text-slate-800">
                  Performance Compare: {user.name} vs. {activeCompareFriend.name}
                </h4>
              </div>

              {/* Statistical sheet */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold items-center">
                <div className="text-left font-bold text-slate-400 text-[10px] tracking-wider uppercase">Criterion</div>
                <div className="text-slate-850 py-1 font-bold">Your Stats</div>
                <div className="bg-indigo-50/60 text-indigo-900 rounded-lg p-1.5 py-1 text-center font-bold">
                  {activeCompareFriend.name}
                </div>

                {/* total xp row */}
                <div className="text-left text-slate-500 py-2 border-b border-slate-50 font-bold">Global XP</div>
                <div className="text-slate-700 py-2 border-b border-slate-50 font-bold">{user.xp} XP</div>
                <div className="text-indigo-900 py-2 border-b border-slate-50 font-bold">{activeCompareFriend.xp} XP</div>

                {/* estimated study hours */}
                <div className="text-left text-slate-500 py-2 border-b border-slate-50 font-bold">Study Duration</div>
                <div className="text-slate-700 py-2 border-b border-slate-50 font-bold">{selfHours} Hours</div>
                <div className="text-indigo-900 py-2 border-b border-slate-50 font-bold">
                  {parseFloat(((activeCompareFriend.xp % 450) / 65 + 4).toFixed(1))} Hours
                </div>

                {/* school class parameters */}
                <div className="text-left text-slate-500 py-2 border-b border-slate-50 font-bold">Academic Class</div>
                <div className="text-slate-700 py-2 border-b border-slate-50 font-bold">Grade {user.grade}</div>
                <div className="text-indigo-900 py-2 border-b border-slate-50 font-bold">Grade {activeCompareFriend.grade}</div>
              </div>

              {/* Graphical duration curves */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                  Graphical Work representation (Estimated Hours studied)
                </span>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>You ({user.name})</span>
                      <span>{selfHours} Hours</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((selfHours / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-indigo-700 mb-1">
                      <span>{activeCompareFriend.name}</span>
                      <span>{parseFloat(((activeCompareFriend.xp % 450) / 65 + 4).toFixed(1))} Hours</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((parseFloat(((activeCompareFriend.xp % 450) / 65 + 4).toFixed(1)) / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100/60 rounded-2xl text-xs font-semibold text-indigo-900 leading-normal">
                📢 {getComparisonAdvice()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-105 p-12 text-center shadow-2xs">
              <span className="text-3xl">🎛️</span>
              <p className="font-sans font-bold text-slate-600 text-xs mt-3 uppercase tracking-wider">Select a Friend for Battle comparison</p>
              <p className="text-slate-405 text-xs mt-1 max-w-[250px] mx-auto font-medium">
                Tap on any classmate inside your active friends bar on the left to review visual comparisons.
              </p>
            </div>
          )}

          {/* GLOBAL ARENA HIGHSCORES LEADERBOARD */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs relative overflow-hidden text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-indigo-700">
                <Trophy className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
                Chapter Leaderboard rankings (XP)
              </h4>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider font-bold">REAL-TIME RANKED</span>
            </div>

            <div className="space-y-3">
              {leaderboardEntries.map((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                      player.isSelf
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'bg-slate-50/70 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-600 font-extrabold text-xs w-6 text-center">{medal}</span>
                      <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-2xs">
                        {renderAvatar(player.avatar)}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-800">
                          {player.name} {player.isSelf && <span className="text-[10px] text-indigo-600 font-extrabold ml-1 uppercase bg-indigo-100/50 px-1.5 py-0.5 rounded">You</span>}
                        </h5>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">@{player.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-amber-600">{player.xp} XP</span>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{player.hours} hrs completed</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
