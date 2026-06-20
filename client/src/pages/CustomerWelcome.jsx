import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coffee, ArrowRight, Loader2, Compass, Layers } from 'lucide-react';

export default function CustomerWelcome() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Captures table position from QR parameters and allows user adjustments
  const [tableInput, setTableInput] = useState(searchParams.get('table') || '01');

  useEffect(() => {
    const fetchPublicMeta = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/restaurants/public/${restaurantId}`);
        if (res.data.success) setRestaurant(res.data.data);
      } catch (err) {
        // Safe preview fallback if database connection is offline
        setRestaurant({
          name: "Roasters & Co. Express",
          primaryColor: "#2310B7",
          about: "Premium artisanal micro-roastery and kitchen floor layout mechanics."
        });
      } finally { setLoading(false); }
    };
    fetchPublicMeta();
  }, [restaurantId]);

  const handleEnterMenu = (e) => {
    e.preventDefault();
    if (!tableInput.trim()) return;
    
    // Smoothly pass execution to the main interactive food list layout
    navigate(`/menu/${restaurantId}?table=${tableInput.trim()}`);
  };

  const brandAccent = restaurant?.primaryColor || '#10b981';

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <Loader2 className="animate-spin mb-2 text-slate-500" size={28} />
      <p className="text-xs text-slate-500">Initializing dining portal...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col justify-between p-6 max-w-md mx-auto border-x border-white/5 shadow-2xl relative overflow-hidden">
      
      {/* Background visual elements aura */}
      <div 
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 blur-[100px] opacity-20 pointer-events-none transition-all duration-500"
        style={{ backgroundColor: brandAccent }}
      ></div>

      {/* Top Brand Identity Intro Block */}
      <div className="pt-12 text-center space-y-4 relative z-10">
        <div 
          className="w-16 h-16 rounded-2.5xl mx-auto flex items-center justify-center border shadow-xl"
          style={{ backgroundColor: `${brandAccent}15`, borderColor: `${brandAccent}33`, color: brandAccent }}
        >
          <Coffee size={28} />
        </div>
        
        <div>
          <h1 className="text-2xl font-black tracking-tight">{restaurant?.name}</h1>
          <p className="text-slate-400 text-xs px-4 mt-2 leading-relaxed">{restaurant?.about}</p>
        </div>
      </div>

      {/* Center Dynamic Desk Seating Target Gate Form */}
      <div className="bg-[#0d0d0d] border border-white/5 p-6 rounded-[2rem] space-y-5 relative z-10 shadow-xl">
        <div className="text-center">
          <span className="text-[9px] bg-white/5 text-slate-400 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
            Verify Seating Station
          </span>
          <p className="text-xs text-slate-500 mt-2">Confirm or enter your current physical table allocation placement to view menus.</p>
        </div>

        <form onSubmit={handleEnterMenu} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-3.5 flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase select-none border-r border-white/5 pr-3">
              <Layers size={12} className="text-slate-600" /> Table
            </div>
            <input 
              required
              type="text"
              placeholder="01"
              value={tableInput}
              className="w-full pl-24 pr-4 py-3.5 bg-[#141414] border border-white/5 rounded-xl text-sm font-bold font-mono tracking-wide outline-none focus:border-white/20 text-white text-center"
              onChange={(e) => setTableInput(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full text-black font-black text-xs py-4 rounded-xl shadow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{ backgroundColor: brandAccent }}
          >
            Explore Interactive Menu <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Footer Branding Label */}
      <div className="text-center py-4">
        <p className="text-[10px] text-slate-600 font-medium tracking-wide flex items-center justify-center gap-1">
          Powered securely by <span className="text-slate-400 font-bold">SwiftServe Grid Engine</span>
        </p>
      </div>

    </div>
  );
}