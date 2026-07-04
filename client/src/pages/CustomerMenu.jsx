import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  Loader2, 
  Search, 
  Home, 
  ClipboardList, 
  CheckCircle,
  CreditCard,
  Smartphone,
  Coins,
  Clock,
  ChevronRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = searchParams.get('table') || '01';

  // Navigation state management (tabs: 'home', 'cart', 'orders')
  const [activeTab, setActiveTab] = useState('home');

  // Core Data Stores bound strictly to database collections
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  // Cart & Order Sub-Systems States
  const [cart, setCart] = useState({});
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  // DYNAMIC MODAL CANCEL SYSTEM STATES
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // FIXED: Point to Render in Production!
  const getBackendUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://swiftserve-saas.onrender.com';
  };

  // Fetch true live menu data and restaurant properties from MongoDB
  const fetchMenuAndBranchDetails = async () => {
    try {
      const resRest = await axios.get(`${getBackendUrl()}/api/restaurants/public/${restaurantId}`);
      if (resRest.data.success) {
        setRestaurant(resRest.data.data);
      }

      const resMenu = await axios.get(`${getBackendUrl()}/api/menu/${restaurantId}`);
      if (resMenu.data.success) {
        setMenuItems(resMenu.data.items || []);
        setCategories(resMenu.data.categories || []);
        if (resMenu.data.categories && resMenu.data.categories.length > 0) {
          setActiveCategory(resMenu.data.categories[0]);
        }
      }
      setDbError(false);
    } catch (err) {
      console.error("Database tracking read exception:", err);
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  // Automated background polling loop checking database for live kitchen ticket lifecycle state alterations
  const syncLiveOrderStatuses = async () => {
    try {
      const res = await axios.get(`${getBackendUrl()}/api/orders/public/${restaurantId}/table/${tableNumber}`);
      if (res.data.success && res.data.orders) {
        const updatedOrders = res.data.orders.map(o => ({
          dbId: o._id, 
          orderId: o._id.substring(18).toUpperCase(),
          date: new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          total: o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          // Clean mapping strings to perfectly sync with UI UI tags
          status: o.status === 'Pending' ? 'Pending' : 
                  o.status === 'Preparing' ? 'Preparing' : 
                  o.status === 'Ready' ? 'Ready to Serve' : 
                  o.status === 'Awaiting Payment' ? 'Served (Unpaid)' : 
                  'Fulfilled', 
          items: o.items
        }));
        setSubmittedOrders(updatedOrders);
      }
    } catch (e) {
      console.log("Background synchronization error skipped.");
    }
  };

  useEffect(() => {
    fetchMenuAndBranchDetails();
  }, [restaurantId]);

  useEffect(() => {
    syncLiveOrderStatuses();
    const statusPollInterval = setInterval(syncLiveOrderStatuses, 3000);
    return () => clearInterval(statusPollInterval);
  }, [restaurantId, tableNumber, activeTab]);

  // Trigger popcard cancel confirmation step
  const triggerCancelConfirmation = (order) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  // Execution call to commit the deletion mutation request down to the server cluster
  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      await axios.delete(`${getBackendUrl()}/api/orders/ticket/${orderToCancel.dbId}`);
      setSubmittedOrders(prev => prev.filter(o => o.dbId !== orderToCancel.dbId));
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      alert("Could not cancel. The kitchen may have already accepted your order.");
      setCancelModalOpen(false);
    }
  };

  // Cart Operations
  const addToCart = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[id] <= 1) delete copy[id];
      else copy[id]--;
      return copy;
    });
  };

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const match = menuItems.find(i => i._id === id);
      return sum + (match ? match.price * qty : 0);
    }, 0);
  };

  const handleCheckoutSubmit = async () => {
    const formattedItems = Object.entries(cart).map(([id, qty]) => {
      const match = menuItems.find(i => i._id === id);
      return { name: match.name, quantity: qty, price: match.price };
    });

    try {
      const res = await axios.post(`${getBackendUrl()}/api/orders/${restaurantId}/submit`, {
        tableNumber,
        items: formattedItems
      });

      if (res.data.success) {
        await syncLiveOrderStatuses();
      }
    } catch(e) {
      console.error("Order writing failed.");
    }

    setCart({});
    setOrderModalOpen(true);
    setActiveTab('orders');
  };

  // FINALIZE BILLING: Updates DB to 'Fulfilled' for History tracking
  const finalizeBilling = async () => {
    try {
      for (const order of submittedOrders) {
        if (order.status !== 'Fulfilled') {
          await axios.put(`${getBackendUrl()}/api/orders/${order.dbId}/status`, { status: 'Fulfilled' });
        }
      }
      setPaymentComplete(true);
    } catch (err) {
      alert("Could not finalize. Please try again.");
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getActiveOrdersTotal = () => {
    return submittedOrders.reduce((sum, o) => sum + o.total, 0);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center text-slate-800">
      <Loader2 className="animate-spin mb-2 text-slate-400" size={24} />
      <p className="text-xs font-medium text-slate-400">Loading catalog matrix parameters...</p>
    </div>
  );

  if (dbError || !restaurant) return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center p-6 text-center text-slate-800">
      <p className="text-sm font-bold text-red-500 mb-2">Location Connection Lost</p>
      <p className="text-xs text-slate-500 max-w-xs">Could not sync dynamic table workspace vectors.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 font-sans max-w-md mx-auto relative flex flex-col justify-between shadow-2xl overflow-hidden pb-28">
      
      {/* ========================================== */}
      {/* ACTIVE VIEW: PRODUCTS HOME DISHES BROWSING  */}
      {/* ========================================== */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Welcome to</p>
              <h1 className="text-xl font-black text-black tracking-tight">{restaurant.name}</h1>
            </div>
            <div className="px-3 py-1.5 bg-black text-white rounded-xl font-black font-mono text-xs flex flex-col items-center shadow-sm">
              <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider">TABLE</span>
              {tableNumber}
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search dishes or catalog items..."
              value={searchQuery}
              className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl text-xs outline-none shadow-sm text-slate-800 font-medium placeholder:text-slate-400 border border-slate-100"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</h3>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
              {categories.map((cat, idx) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected 
                        ? 'bg-black border-black text-white shadow-md' 
                        : 'bg-white border-slate-100 text-slate-500 font-medium'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Our Products</h3>
            {filteredItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No items found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <div className="w-full h-28 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden mb-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-black tracking-tight truncate mb-0.5">{item.name}</h4>
                      <p className="text-[9px] text-slate-400 line-clamp-2 leading-normal mb-2 min-h-[24px]">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 mt-auto">
                      <span className="text-xs font-black font-mono text-black">${parseFloat(item.price).toFixed(2)}</span>
                      
                      {!cart[item._id] ? (
                        <button 
                          onClick={() => addToCart(item._id)}
                          className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shadow transition active:scale-95 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      ) : (
                        <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-1.5 shadow-inner">
                          <button onClick={() => removeFromCart(item._id)} className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center cursor-pointer shadow-sm"><Minus size={10} /></button>
                          <span className="text-[10px] font-bold font-mono min-w-[8px] text-center">{cart[item._id]}</span>
                          <button onClick={() => addToCart(item._id)} className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center cursor-pointer shadow-sm"><Plus size={10} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* ACTIVE VIEW: SHOPPING CART BASKET OVERVIEW */}
      {/* ========================================== */}
      {activeTab === 'cart' && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-black text-black mb-4">My Cart Bag</h2>
            {Object.keys(cart).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12 font-medium">Your selection cart is currently empty.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(cart).map(([id, qty]) => {
                  const match = menuItems.find(i => i._id === id);
                  if (!match) return null;
                  return (
                    <div key={id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-3 min-w-0">
                        {match.imageUrl ? (
                          <img src={match.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xs flex-shrink-0">🍽️</div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-black tracking-tight truncate">{match.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">${parseFloat(match.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-2 flex-shrink-0">
                        <button onClick={() => removeFromCart(id)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center cursor-pointer"><Minus size={11} /></button>
                        <span className="text-xs font-bold font-mono text-center min-w-[10px]">{qty}</span>
                        <button onClick={() => addToCart(id)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center cursor-pointer"><Plus size={11} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {Object.keys(cart).length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm mt-8">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Ordering Station</span>
                <span className="text-black font-bold font-mono">Table #{tableNumber}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-50 pt-3">
                <span className="text-xs font-bold text-slate-800">Total Bill Value</span>
                <span className="text-lg font-black font-mono text-black">${getCartTotal().toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckoutSubmit}
                className="w-full bg-black text-white py-3.5 rounded-xl font-black text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-900"
              >
                Place Order Ticket <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* ACTIVE VIEW: REAL-TIME TICKETS MONITOR LIST */}
      {/* ========================================== */}
      {activeTab === 'orders' && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
          <h2 className="text-lg font-black text-black">My Running Orders</h2>
          
          {submittedOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12 font-medium">No active kitchen orders transmitted yet.</p>
          ) : (
            <>
              {/* TICKETS TIMELINE GRID DISPLAY */}
              <div className="space-y-3">
                {submittedOrders.map((ord, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-black tracking-tight mb-0.5">#{ord.orderId}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{ord.date}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span className={`text-[9px] border px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                          ord.status === 'Ready to Serve' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' 
                            : ord.status === 'Preparing' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : ord.status === 'Served (Unpaid)'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <Clock size={10} /> {ord.status}
                        </span>

                        {/* CANCEL ACTION: Triggers internal clean popcard modal state hooks */}
                        {ord.status === 'Pending' && (
                          <button 
                            onClick={() => triggerCancelConfirmation(ord)}
                            className="p-1.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between text-xs font-medium text-slate-600">
                          <span>{it.name} <span className="text-slate-400 font-mono text-[10px]">x{it.quantity}</span></span>
                          <span className="text-black font-mono">${(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* PAYMENT CHECKOUT PANEL TERMINAL CARD */}
              <div className="bg-black text-white rounded-3xl p-5 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight">Settlement Checkout</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Choose your invoice summary remittance pathway.</p>
                </div>

                <div className="flex justify-between items-baseline border-b border-white/10 pb-3 font-mono">
                  <span className="text-xs font-bold text-slate-400">Total Combined Balance</span>
                  <span className="text-xl font-black text-[#FFB01D]">${getActiveOrdersTotal().toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <button onClick={() => setSelectedPaymentMethod('card')} className={`w-full p-3 bg-white/5 border rounded-xl flex items-center justify-between text-xs font-semibold transition ${selectedPaymentMethod === 'card' ? 'border-[#FFB01D] text-[#FFB01D]' : 'border-white/5 text-slate-300'}`}>
                    <span className="flex items-center gap-2"><CreditCard size={14} /> Pay by Card</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">Update Soon</span>
                  </button>

                  <button onClick={() => setSelectedPaymentMethod('upi')} className={`w-full p-3 bg-white/5 border rounded-xl flex items-center justify-between text-xs font-semibold transition ${selectedPaymentMethod === 'upi' ? 'border-[#FFB01D] text-[#FFB01D]' : 'border-white/5 text-slate-300'}`}>
                    <span className="flex items-center gap-2"><Smartphone size={14} /> Instant UPI Transfer</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">Update Soon</span>
                  </button>

                  <button onClick={() => setSelectedPaymentMethod('cash')} className={`w-full p-3 bg-white/5 border rounded-xl flex items-center justify-between text-xs font-semibold transition ${selectedPaymentMethod === 'cash' ? 'border-[#FFB01D] text-[#FFB01D]' : 'border-white/5 text-slate-300'}`}>
                    <span className="flex items-center gap-2"><Coins size={14} /> Frontdesk Cash Remittance</span>
                    <ChevronRight size={14} className="text-slate-500" />
                  </button>
                </div>

                {selectedPaymentMethod === 'cash' && (
                  <button 
                    onClick={finalizeBilling}
                    className="w-full bg-[#FFB01D] text-black py-3 rounded-xl font-black text-xs transition shadow-md flex items-center justify-center gap-1 cursor-pointer hover:bg-yellow-400"
                  >
                    Request Bill Settlement Call
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* NEW FLOATING MICRO-INTERACTION NAVBAR      */}
      {/* ========================================== */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
        <nav className="bg-[#0f0f0f] w-[90%] max-w-[340px] rounded-[2rem] px-6 py-3 flex items-center justify-between pointer-events-auto shadow-2xl shadow-black/30">
          
          {[
            { id: 'home', Icon: Home },
            { id: 'cart', Icon: ShoppingBag },
            { id: 'orders', Icon: ClipboardList }
          ].map(({ id, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button 
                key={id}
                onClick={() => setActiveTab(id)} 
                className={`relative flex items-center justify-center transition-all duration-500 ease-out cursor-pointer z-10 ${
                  isActive ? 'w-12 h-12' : 'w-10 h-10'
                }`}
              >
                {/* Animated Background Pill */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-[#FFB01D] scale-100 opacity-100 shadow-[0_4px_15px_rgba(255,176,29,0.3)]' 
                    : 'bg-transparent scale-50 opacity-0'
                }`} />
                
                {/* Icon */}
                <Icon 
                  size={isActive ? 20 : 22} 
                  className={`relative transition-colors duration-300 ease-in-out ${
                    isActive ? 'text-black stroke-[2.5px]' : 'text-slate-400 hover:text-white'
                  }`} 
                />

                {/* Notification Badges */}
                {id === 'cart' && cartItemCount > 0 && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFB01D] rounded-full border border-[#0f0f0f]"></span>
                )}
                {id === 'orders' && submittedOrders.length > 0 && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0f0f0f]"></span>
                )}
              </button>
            );
          })}
          
        </nav>
      </div>

      {/* ========================================== */}
      {/* POPCARD MODAL: ORDER SENT TO KITCHEN BANNER */}
      {/* ========================================== */}
      {orderModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full text-center space-y-4 shadow-2xl border border-slate-50">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle size={22} className="fill-current text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-black">Order Dispatched!</h3>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mt-1">
                Your selections were sent straight to the back-of-house kitchen monitor. Track progress live inside your orders timeline tab.
              </p>
            </div>
            <button onClick={() => setOrderModalOpen(false)} className="w-full bg-slate-100 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition hover:bg-slate-200 cursor-pointer">Dismiss View</button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PREMIUM POPCARD MODAL: TICKET CANCELLATION */}
      {/* ========================================== */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full text-center space-y-5 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-black">Cancel Order Ticket?</h3>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mt-1">
                This will instantly remove ticket <span className="font-bold text-black font-mono">#{orderToCancel?.orderId}</span> from the back-of-house kitchen monitor loops.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button 
                onClick={() => { setCancelModalOpen(false); setOrderToCancel(null); }}
                className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                No, Keep It
              </button>
              <button 
                onClick={handleConfirmCancelOrder}
                className="w-full bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-600 transition cursor-pointer shadow-md shadow-red-900/10"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY POPUP: CASH CALL SETTLEMENT ASSISTANCE */}
      {paymentComplete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-black">Assistance Requested</h3>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mt-1">
                A server is heading to <span className="font-bold text-black">Table {tableNumber}</span> with your invoice summary. Please have cash ready.
              </p>
            </div>
            <button 
              onClick={() => {
                setPaymentComplete(false);
                setSelectedPaymentMethod('');
                setSubmittedOrders([]);
                navigate(`/welcome/${restaurantId}?table=${tableNumber}`);
              }}
              className="w-full bg-black text-white py-2.5 rounded-xl text-xs font-bold transition cursor-pointer hover:bg-slate-900"
            >
              Return to Welcome Entrance
            </button>
          </div>
        </div>
      )}

    </div>
  );
}