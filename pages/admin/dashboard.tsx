import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  // Состояния для статистики
  const [stats, setStats] = useState({ totalUsers: 0, totalBeads: 0 });
  // Состояния для управления игроками
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Загрузка общей статистики
  const fetchStats = async () => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: sumData } = await supabase.rpc('get_total_beads');
    setStats({
      totalUsers: count || 0,
      totalBeads: sumData || 0
    });
  };

  // 2. Поиск игроков
  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${search}%`)
      .limit(10);
    if (data) setUsers(data);
    setLoading(false);
  };

  // 3. Начисление Beads (вызов SQL функции)
  const addBeads = async (userId: string, amount: number) => {
    const { error } = await supabase.rpc('add_beads', { user_id: userId, amount: amount });
    if (!error) {
      alert(`Начислено ${amount} Beads!`);
      fetchUsers(); // Обновляем список
      fetchStats(); // Обновляем общую статистику
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black tracking-tighter text-blue-500">BEADSLINE ADMIN <span className="text-slate-500">2026</span></h1>
          <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
            SYSTEM ONLINE
          </div>
        </header>

        {/* СЕКЦИЯ СТАТИСТИКИ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Players</p>
            <p className="text-5xl font-black mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Global Beads Supply</p>
            <p className="text-5xl font-black mt-2 text-yellow-500">{stats.totalBeads.toLocaleString()}</p>
          </div>
        </div>

        {/* СЕКЦИЯ УПРАВЛЕНИЯ ИГРОКАМИ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold mb-4 text-slate-200">Player Management</h2>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Search by username..." 
                className="bg-slate-800 border border-slate-700 p-3 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                onClick={fetchUsers}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-slate-800">
                  <th className="pb-4">Username</th>
                  <th className="pb-4">Current Balance</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="group">
                    <td className="py-4 font-semibold text-slate-200">{user.username || 'Anonymous'}</td>
                    <td className="py-4 text-yellow-500 font-mono font-bold">{user.beads_balance.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => addBeads(user.id, 500)}
                        className="bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white border border-green-500/20 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                      >
                        +500 Beads
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-600 italic">
                      Use the search bar to find players
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}