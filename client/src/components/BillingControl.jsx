import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Loader2, CheckCircle2, Receipt, RefreshCw } from 'lucide-react';

export default function BillingControl({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allOrdersDebug, setAllOrdersDebug] = useState([]); // Added to see everything

  // FIXED: Point to Render in Production!
  const getBackendUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://swiftserve-saas.onrender.com';
  };

  const fetchUnpaidBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${getBackendUrl()}/api/orders/${restaurantId}/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setAllOrdersDebug(res.data.orders); // Save all for debugging
        
        // FLEXIBLE FILTER: Handles case sensitivity and extra spaces
        const filtered = res.data.orders.filter(o => 
          o.status.toLowerCase().trim() === 'awaiting payment' || 
          o.status === 'Awaiting Payment'
        );
        setOrders(filtered);
      }
    } catch (err) {
      console.error("Failed to sync billing nodes.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidBills();
    const syncInterval = setInterval(fetchUnpaidBills, 4000);
    return () => clearInterval(syncInterval);
  }, [restaurantId]);

  const confirmPayment = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${getBackendUrl()}/api/orders/${orderId}/status`, 
        { status: 'Fulfilled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      alert('Failed to clear bill. Check backend logs.');
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
      <Loader2 size={16} className="animate-spin text-emerald-400" />
      <span>Booting cashier registry...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* DEBUG SECTION: REMOVE THIS DIV AFTER TESTING */}
      <div className="bg-white/5 p-4 rounded-xl text-[9px] text-slate-400 overflow-x-auto">
        <p className="font-bold text-white mb-1">DEV DEBUG - CURRENT STATUSES IN DB:</p>
        {JSON.stringify(allOrdersDebug.map(o => ({ id: o._id.slice(-4), status: o.status })))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-16 text-center">
          <Receipt className="mx-auto text-slate-700 mb-3" size={40} />
          <p className="text-sm text-slate-500">No tables are currently waiting to pay.</p>
          <button onClick={fetchUnpaidBills} className="mt-4 flex items-center gap-2 mx-auto text-[10px] text-emerald-400 underline">
            <RefreshCw size={10} /> Refresh Manually
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return (
              <div key={order._id} className="bg-[#121212] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                      <DollarSign size={14} /> <span>Awaiting Settlement</span>
                    </div>
                    <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded shadow-sm">
                      TABLE {order.tableNumber}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-400">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-2xl font-black text-white font-mono border-t border-white/5 pt-2">
                    ${orderTotal.toFixed(2)}
                  </div>
                </div>
                <button 
                  onClick={() => confirmPayment(order._id)}
                  className="w-full bg-emerald-500 text-black font-black text-xs py-3 rounded-xl hover:bg-emerald-400 transition cursor-pointer mt-4"
                >
                  Confirm Payment
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}