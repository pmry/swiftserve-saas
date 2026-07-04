import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Clock, ChefHat, AlertCircle, Loader2 } from 'lucide-react';

export default function KitchenControl({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  function getBackendUrl() {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://swiftserve-saas.onrender.com';
  }

  const fetchActiveTickets = async (isInitialLoad = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${getBackendUrl()}/api/orders/${restaurantId}/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success && isMounted.current) {
        // Only show orders that are NOT yet Fulfilled
        const kitchenTickets = res.data.orders.filter(o => o.status !== 'Fulfilled');
        setOrders(kitchenTickets);
        setError('');
      }
    } catch (err) {
      if (isMounted.current) setError('Failed to sync with order desk.');
    } finally {
      if (isInitialLoad && isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchActiveTickets(true);
    const syncInterval = setInterval(() => fetchActiveTickets(false), 4000);
    return () => { isMounted.current = false; clearInterval(syncInterval); };
  }, [restaurantId]);

  const advanceOrderStatus = async (orderId, currentStatus) => {
    // WORKFLOW: Pending -> Preparing -> Ready -> Fulfilled (Complete)
    let nextStatus = 'Preparing';
    if (currentStatus === 'Preparing') nextStatus = 'Ready';
    
    // Sends to customer for final checkout/history
    if (currentStatus === 'Ready') nextStatus = 'Fulfilled'; 

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${getBackendUrl()}/api/orders/${orderId}/status`, 
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Instantly remove from Kitchen UI if completed
      if (nextStatus === 'Fulfilled') {
        setOrders(prev => prev.filter(o => o._id !== orderId));
      } else {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: nextStatus } : o));
      }
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
      <Loader2 size={16} className="animate-spin text-emerald-400" />
      <span>Booting kitchen command...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-16 text-center">
          <ChefHat className="mx-auto text-slate-700 mb-3" size={40} />
          <p className="text-sm text-slate-500">Kitchen command array pipeline is completely clear.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400">TABLE {order.tableNumber}</span>
                <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase ${
                  order.status === 'Ready' ? 'bg-amber-500/20 text-amber-400' : 'text-emerald-400'
                }`}>{order.status}</span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-300">
                    <span>{item.name}</span>
                    <span className="font-mono text-emerald-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => advanceOrderStatus(order._id, order.status)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                  order.status === 'Pending' ? 'bg-emerald-500 text-black hover:bg-emerald-400' :
                  order.status === 'Preparing' ? 'bg-amber-500 text-black hover:bg-amber-400' :
                  'bg-purple-600 text-white hover:bg-purple-500' // Purple for completion
                }`}
              >
                {order.status === 'Pending' ? 'Accept Order' : 
                 order.status === 'Preparing' ? 'Mark Ready' : 'Complete & Send to History'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}