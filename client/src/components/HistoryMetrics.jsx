import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, CheckCircle2, Clock, Loader2, Calendar } from 'lucide-react';

export default function HistoryMetrics({ restaurantId }) {
  const [metrics, setMetrics] = useState({ totalRevenue: 0, ordersCount: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendBaseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000' 
          : `${window.location.protocol}//${window.location.hostname.replace('-5173', '-5000')}`;

        const res = await axios.get(`${backendBaseUrl}/api/orders/${restaurantId}/metrics`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError('Could not aggregate today’s financial data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Auto-refresh metrics every 15 seconds to see money coming in live
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
      <Loader2 size={16} className="animate-spin text-emerald-400" />
      <span>Calculating daily revenue metrics...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* TOP REVENUE DASHBOARD CARDS */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Collection Card */}
        <div className="bg-gradient-to-br from-[#0d0d0d] to-[#121212] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition duration-500">
            <DollarSign size={80} />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 mb-3 uppercase tracking-wider">
            <TrendingUp size={14} /> Today's Total Collection
          </div>
          <h2 className="text-4xl font-black text-white font-mono tracking-tight">
            ${metrics.totalRevenue.toFixed(2)}
          </h2>
          <p className="text-[10px] text-slate-500 mt-2">Gross revenue calculated from fulfilled tables</p>
        </div>

        {/* Orders Count Card */}
        <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-3 uppercase tracking-wider">
            <CheckCircle2 size={14} className="text-purple-400" /> Tickets Fulfilled Today
          </div>
          <h2 className="text-4xl font-black text-white font-mono tracking-tight">
            {metrics.ordersCount}
          </h2>
          <p className="text-[10px] text-slate-500 mt-2">Total successful kitchen dispatches</p>
        </div>
      </div>

      {/* COMPLETED TICKETS HISTORY LOG */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-400" /> Completed Order History
          </h3>
          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {metrics.history.length === 0 ? (
          <div className="text-center py-12 border border-white/5 border-dashed rounded-xl">
            <Clock className="mx-auto text-slate-700 mb-3" size={24} />
            <p className="text-xs text-slate-500">No orders have been fulfilled yet today.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
            {metrics.history.map((order) => {
              const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const time = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={order._id} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                      T{order.tableNumber}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">
                        Order #{order._id.substring(18).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> Fulfilled at {time}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 md:px-6">
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}