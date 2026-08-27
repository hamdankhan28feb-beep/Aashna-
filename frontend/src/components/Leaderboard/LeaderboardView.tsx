import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

interface LeaderboardUser {
  id: string;
  email: string;
  xp: number;
  level: number;
  dailyStreak: number;
}

export const LeaderboardView: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedUsers.push({
            id: doc.id,
            email: data.email || 'Anonymous Scholar',
            xp: data.xp || 0,
            level: data.level || 1,
            dailyStreak: data.dailyStreak || 0
          });
        });
        
        setUsers(fetchedUsers);
      } catch (e) {
        console.error("Error fetching leaderboard", e);
        setError('Leaderboard unavailable. Check your Firebase connection and Firestore rules.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankBadge = (index: number) => {
    switch(index) {
      case 0: return <span className="text-3xl" title="1st Place">👑</span>;
      case 1: return <span className="text-3xl" title="2nd Place">🥈</span>;
      case 2: return <span className="text-3xl" title="3rd Place">🥉</span>;
      default: return <span className="text-xl font-black text-slate-400 w-8 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-[2rem] p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <span>🏆</span> Global Leaderboard
          </h1>
          <p className="text-violet-100 font-bold text-lg">
            Compete with other ASL learners around the world!
          </p>
        </div>
        <div className="text-7xl opacity-80 animate-bounce">🌎</div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 lg:p-8 border-4 border-white shadow-[0_20px_50px_-12px_rgba(139,92,246,0.1)]">
        {loading ? (
          <div className="w-full py-12 flex justify-center items-center flex-col gap-4">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold">Loading Top Scholars...</p>
          </div>
        ) : error ? (
          <div className="w-full py-12 text-center">
            <p className="text-rose-500 font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-violet-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-violet-600"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="w-full py-12 text-center text-slate-400 font-bold">
            No one is on the leaderboard yet! Be the first!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user, index) => {
              const isMe = auth.currentUser?.uid === user.id;
              
              return (
                <div 
                  key={user.id}
                  className={`flex items-center gap-4 lg:gap-6 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    isMe 
                      ? 'bg-violet-50 border-2 border-violet-300 shadow-md' 
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="w-12 flex justify-center items-center">
                    {getRankBadge(index)}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <span className="font-black text-slate-700 text-lg flex items-center gap-2">
                      {user.email.split('@')[0]}
                      {isMe && <span className="bg-violet-500 text-white text-[10px] uppercase px-2 py-1 rounded-full">You</span>}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">
                      Level {user.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-sm font-black text-orange-400 uppercase tracking-wider">Streak</span>
                      <span className="font-bold text-slate-600">🔥 {user.dailyStreak}</span>
                    </div>
                    
                    <div className="flex flex-col items-end w-24">
                      <span className="text-sm font-black text-violet-400 uppercase tracking-wider">XP</span>
                      <span className="font-black text-violet-600 text-xl">{user.xp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
