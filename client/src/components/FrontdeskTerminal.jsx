import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle2, Receipt, AlertCircle, RefreshCw } from 'lucide-react';

export default function FrontdeskTerminal({ restaurantId }) {
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // FIXED: Point to Render in Production!
  const getBackendUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://swiftserve-saas.onrender.com';
  };

  const fetchActiveBills = async (isInitial = false) => {
    try {
      const token = localStorage.getItem('token'); // ADDED: Security Token
      
      const res = await axios.get(`${getBackendUrl()}/api/orders/${restaurantId}/pending`, {
        headers: { Authorization: `Bearer ${token}` } // ADDED: Auth Header
      });
      
      if (res.data.success && isMounted.current) {
        // Filter for orders specifically in 'Awaiting Payment' status
        const bills = res.data.orders.filter(o => o.status === 'Awaiting Payment');
        setUnpaidOrders(bills);
      }
    } catch (err) {
      console.error("Cashier sync error", err);
    } finally {
      if (isInitial && isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchActiveBills(true);
    const interval = setInterval(() => fetchActiveBills(false), 3000); // Poll for live updates
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [restaurantId]);

  const processPayment = async (orderId) => {
    try {
      const token = localStorage.getItem('token'); // ADDED: Security Token
      
      await axios.put(`${getBackendUrl()}/api/orders/${orderId}/status`, 
        { status: 'Fulfilled' },
        { headers: { Authorization: `Bearer ${token}` } } // ADDED: Auth Header
      );
      
      fetchActiveBills(); // Refresh list immediately
    } catch (err) {
      alert("Failed to process payment. Please check connection.");
    }
  };

  return (
    <div className="p-8 bg-[#0a0a0a] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <CreditCard className="text-emerald-400" /> FRONTDESK TERMINAL
        </h1>
        <button onClick={() => fetchActiveBills(false)} className="p-2 hover:bg-white/5 rounded-full"><RefreshCw size={18}/></button>
      </div>

      {unpaidOrders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl text-slate-500">
          <Receipt size={48} className="mx-auto mb-4 opacity-50" />
          <p>No pending settlements. Cash register is clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {unpaidOrders.map(order => (
            <div key={order._id} className="bg-[#121212] p-6 rounded-3xl border border-white/10 shadow-xl">
              <div className="text-4xl font-black mb-4">Table {order.tableNumber}</div>
              <div className="text-sm text-slate-400 mb-4 border-b border-white/5 pb-4">
                {order.items.map((it, i) => <div key={i}>{it.quantity}x {it.name}</div>)}
              </div>
              <div className="text-2xl font-bold mb-6 text-emerald-400">
                Total: ${order.items.reduce((s, it) => s + (it.price * it.quantity), 0).toFixed(2)}
              </div>
              <button 
                onClick={() => processPayment(order._id)}
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition"
              >
                CONFIRM PAYMENT
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}