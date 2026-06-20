import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
// Added 'CreditCard' to the lucide-react imports
import { Utensils, Grid, ChefHat, ChevronLeft, ChevronRight, Store, User, TrendingUp, CreditCard } from 'lucide-react';

// Import our dedicated sub-components
import MenuControl from '../components/MenuControl';
import TablesControl from '../components/TablesControl';
import KitchenControl from '../components/KitchenControl';
import HistoryMetrics from '../components/HistoryMetrics';
import BillingControl from '../components/BillingControl';
import FrontdeskTerminal from '../components/FrontdeskTerminal'; // <-- Added Billing Import

export default function DashboardLayout() {
  const { restaurantId } = useParams();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); 
  const [restaurantName, setRestaurantName] = useState('Workspace Branch');

  useEffect(() => {
    const fetchBranchMeta = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendBaseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5000' 
          : `${window.location.protocol}//${window.location.hostname.replace('-5173', '-5000')}`;

        const res = await axios.get(`${backendBaseUrl}/api/restaurants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentBranch = res.data.data.find(b => b._id === restaurantId);
        if (currentBranch) setRestaurantName(currentBranch.name);
      } catch (err) { console.error('Failed to sync workspace parameters'); }
    };
    fetchBranchMeta();
  }, [restaurantId]);

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`bg-[#0d0d0d] border-r border-white/5 flex flex-col justify-between p-4 transition-all duration-300 relative select-none ${
        isSidebarExpanded ? 'w-64' : 'w-20'
      }`}>
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer z-50 shadow-xl"
        >
          {isSidebarExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/40">
              <Store size={18} className="text-black font-black" />
            </div>
            {isSidebarExpanded && (
              <div className="animate-fadeIn overflow-hidden">
                <p className="font-semibold text-sm tracking-tight truncate max-w-[160px]">{restaurantName}</p>
                <Link to="/home" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5">← Exit to Hub</Link>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'menu' ? 'bg-white/5 border border-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Utensils size={16} className={activeTab === 'menu' ? 'text-emerald-400' : ''} />
              {isSidebarExpanded && <span>Menu Management</span>}
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'tables' ? 'bg-white/5 border border-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid size={16} className={activeTab === 'tables' ? 'text-emerald-400' : ''} />
              {isSidebarExpanded && <span>Table Operations</span>}
            </button>

            <button
              onClick={() => setActiveTab('kitchen')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'kitchen' ? 'bg-white/5 border border-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChefHat size={16} className={activeTab === 'kitchen' ? 'text-emerald-400' : ''} />
              {isSidebarExpanded && <span>Kitchen Tickets</span>}
            </button>

            {/* ---> BILLING / FRONTDESK CHECKOUT TAB <--- */}
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'billing' ? 'bg-white/5 border border-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard size={16} className={activeTab === 'billing' ? 'text-blue-400' : ''} />
              {isSidebarExpanded && <span>Frontdesk Checkout</span>}
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'metrics' ? 'bg-white/5 border border-white/10 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={16} className={activeTab === 'metrics' ? 'text-emerald-400' : ''} />
              {isSidebarExpanded && <span>History & Revenue</span>}
            </button>

          </nav>
        </div>

        {isSidebarExpanded && (
          <div className="p-3 bg-[#121212] rounded-xl border border-white/5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400"><User size={14} /></div>
            <div>
              <p className="text-[10px] font-medium truncate">Admin Operator</p>
              <p className="text-[8px] text-slate-500 tracking-wide uppercase font-semibold">Live Console</p>
            </div>
          </div>
        )}
      </aside>

      {/* CORE WORKSPACE SUB-PANEL MAIN CONTENT DISPLAY */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-6xl">
        {activeTab === 'menu' && <MenuControl restaurantId={restaurantId} />}
        {activeTab === 'tables' && <TablesControl restaurantId={restaurantId} />}
        {activeTab === 'kitchen' && <KitchenControl restaurantId={restaurantId} />}
        {/* ---> BILLING COMPONENT RENDERED HERE <--- */}
        {activeTab === 'billing' && <BillingControl restaurantId={restaurantId} />}
        {activeTab === 'metrics' && <HistoryMetrics restaurantId={restaurantId} />}
        {activeTab === 'frontdesk'&& <FrontdeskTerminal restaurantId={restaurantId} />}
      </main>

    </div>
  );
}