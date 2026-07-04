import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; // <-- Ensure qr code library is imported
import { Plus, Edit2, Trash2, LogOut, LayoutDashboard, QrCode, X, ExternalLink, Coffee, Utensils } from 'lucide-react';

export default function UserLandingPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


 // FIXED: Dynamic URL logic for deployment
  const getBackendUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://swiftserve-saas.onrender.com';
  };

  // QR Preview Modal System States
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [targetWelcomeUrl, setTargetWelcomeUrl] = useState('');

  // Fetch all branches owned by the logged-in user
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      // FIXED: Using getBackendUrl()
      const res = await axios.get(`${getBackendUrl()}/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setRestaurants(res.data.data);
    } catch (err) {
      setError('Failed to fetch active workspace operational metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Handler to generate and show QR code pointing to CustomerWelcome.jsx
  const handleOpenQrModal = (branch) => {
    // Generate a default routing link for Table 01 to seed the Welcome Page
    const welcomeUrl = `${window.location.origin}/welcome/${branch._id}?table=01`;
    setTargetWelcomeUrl(welcomeUrl);
    setSelectedBranch(branch);
    setQrModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to purge this restaurant cluster node?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBranches();
    } catch (err) {
      alert('Failed to delete branch.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      
      {/* HEADER TOP BAR */}
      <header className="border-b border-white/5 bg-[#0d0d0d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-black">
            <Coffee size={16} />
          </div>
          <span className="font-semibold text-sm tracking-tight">SwiftServe Hub</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white transition cursor-pointer"
        >
          <LogOut size={13} /> Log Out
        </button>
      </header>

      {/* CORE CONTENT PANELS */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Workspace Central</h1>
          <p className="text-slate-500 text-xs mt-1">Deploy standalone configuration structures or modify branch allocations.</p>
        </div>

        {error && <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-6">{error}</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* RENDER LIST OF BRANCHES */}
          {restaurants.map((branch) => (
            <div key={branch._id} className="bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Utensils size={18} />
                  </div>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition">
                    <button className="p-2 text-slate-400 hover:text-white transition cursor-pointer"><Edit2 size={13} /></button>
                    <button onClick={() => handleDeleteBranch(branch._id)} className="p-2 text-slate-500 hover:text-red-400 transition cursor-pointer"><Trash2 size={13} /></button>
                  </div>
                </div>

                <h3 className="text-lg font-bold tracking-tight mb-1">{branch.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{branch.tablesCount || 0} Tables Configured</p>
              </div>

              {/* ACTION CALL BUTTONS ROW */}
              <div className="grid grid-cols-2 gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                  onClick={() => navigate(`/dashboard/${branch._id}`)}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer shadow-md"
                >
                  <LayoutDashboard size={13} /> Dashboard
                </button>
                
                {/* CONNECTED ACTION: Opens public welcome qr overlay map instantly */}
                <button 
                  onClick={() => handleOpenQrModal(branch)}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold rounded-xl text-slate-300 transition cursor-pointer"
                >
                  <QrCode size={13} /> QR Codes
                </button>
              </div>

            </div>
          ))}

          {/* ADD NEW BRANCH INITIAL DASH CARD CARD */}
          <div 
            onClick={() => navigate('/onboarding/restaurant')}
            className="border border-white/5 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-white/[0.01] hover:border-white/10 transition duration-300 cursor-pointer min-h-[190px]"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
              <Plus size={16} />
            </div>
            <h4 className="text-sm font-semibold text-slate-300 mt-4 mb-0.5">Add New Branch</h4>
            <p className="text-[10px] text-slate-500 max-w-[180px]">Deploy another digital menu and table QR instance</p>
          </div>

        </div>
      </main>

      {/* ========================================== */}
      {/* CENTRALIZED QUICK PREVIEW QR OVERLAY MODAL */}
      {/* ========================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full relative text-center shadow-2xl">
            <button 
              onClick={() => setQrModalOpen(false)} 
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
              {selectedBranch?.name} Portal
            </span>
            <h3 className="text-base font-semibold mt-3 mb-1">Public Entry QR Vector</h3>
            <p className="text-slate-500 text-[11px] mb-6 max-w-[240px] mx-auto leading-normal">
              Points directly to your digital customer welcome gate for interactive orders.
            </p>

            {/* LIVE SCANNABLE VECTOR GENERATOR BOX */}
            <div className="w-44 h-44 bg-white rounded-2xl p-4 mx-auto flex items-center justify-center shadow-inner">
              <QRCodeSVG 
                value={targetWelcomeUrl}
                size={144}
                level={"M"}
              />
            </div>

            {/* Direct testing target link triggers */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <a 
                href={targetWelcomeUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition text-slate-300"
              >
                Launch Live Customer View <ExternalLink size={12} />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}