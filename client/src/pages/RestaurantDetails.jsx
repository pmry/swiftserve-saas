import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store, Palette, Info, ArrowRight, Camera, ArrowLeft, Grid } from 'lucide-react';

export default function RestaurantDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Updated form states to include tablesCount as required
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    primaryColor: '#10b981', 
    logoUrl: '',
    tablesCount: '' // <-- NEW FIELD: tracks total setup layout structure
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Ensure numeric formatting matches schema structural expectations
    const payload = {
      ...formData,
      tablesCount: parseInt(formData.tablesCount, 10) || 0
    };

    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post('http://localhost:5000/api/restaurants', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        navigate(`/onboarding/menu/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white font-sans">
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 gap-4">
        
        {/* LEFT PANEL: Live Configuration Preview Card */}
        <div className="hidden md:flex md:w-1/2 rounded-[2rem] bg-gradient-to-br from-[#113d2f] via-[#0b261d] to-[#05100c] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_20%,rgba(52,211,153,0.1),transparent_60%)]"></div>
          
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <h1 className="text-4xl font-semibold mb-2 leading-tight">Workspace<br/>Identity</h1>
            <p className="text-[#a0bba8] text-xs mb-12">See how your customization choices will render on a customer's phone.</p>

            {/* Simulated Live Customer UI Mockup Box */}
            <div className="w-full bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-2 transition-all duration-300"
                style={{ backgroundColor: formData.primaryColor }}
              ></div>

              {/* Mock Logo Space */}
              <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-white/5 mx-auto mb-4 flex items-center justify-center overflow-hidden transition-all">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-slate-600" />
                )}
              </div>

              {/* Dynamic Text Displays */}
              <h3 className="text-center font-semibold text-lg tracking-tight mb-1 truncate">
                {formData.name || 'Your Cafe Name'}
              </h3>
              
              {/* Live Table Tracking Preview Metric */}
              <p className="text-center text-slate-500 text-[11px] mb-6 tracking-wide uppercase font-medium">
                Active Mock View: Table #{formData.tablesCount ? String(Math.min(4, formData.tablesCount)).padStart(2, '0') : '01'}
              </p>
              
              <p className="text-slate-400 text-xs text-center line-clamp-3 mb-6 bg-[#121212] p-3 rounded-xl border border-white/5 min-h-[64px]">
                {formData.about || 'Provide a beautiful narrative introduction explaining your workspace brand identity.'}
              </p>

              <div 
                className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-black transition-all duration-300"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Browse Interactive Menu
              </div>
            </div>

            <div className="flex gap-4 mt-12 justify-center">
              <span className="w-8 h-1 bg-white rounded-full"></span>
              <span className="w-8 h-1 bg-white/20 rounded-full"></span>
              <span className="w-8 h-1 bg-white/20 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-16">
          <div className="w-full max-w-[420px]">
            
            <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-6 transition">
              <ArrowLeft size={14} /> Back to Hub
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Create New Branch</h2>
              <p className="text-[#888888] text-xs">Define your menu layout's global parameters and system variables.</p>
            </div>

            {error && (
              <p className="text-red-400 text-xs mb-6 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Input */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-2">
                  <Store size={14} className="text-emerald-400" /> Cafe Name
                </label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  className="w-full px-4 py-3 bg-[#121212] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#333333] transition-all placeholder:text-[#555555]"
                  placeholder="eg. Bluebird Coffee Co."
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* NEW FIELD: Total Shop Floor Tables Count */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-2">
                  <Grid size={14} className="text-emerald-400" /> Total Tables in Shop
                </label>
                <input 
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={formData.tablesCount}
                  className="w-full px-4 py-3 bg-[#121212] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#333333] transition-all placeholder:text-[#555555]"
                  placeholder="eg. 15"
                  onChange={(e) => setFormData({...formData, tablesCount: e.target.value})}
                />
              </div>

              {/* Logo URL Input */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-2">
                  <Camera size={14} className="text-emerald-400" /> Logo Image URL
                </label>
                <input 
                  type="url"
                  value={formData.logoUrl}
                  className="w-full px-4 py-3 bg-[#121212] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#333333] transition-all placeholder:text-[#555555]"
                  placeholder="https://example.com/logo.png"
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                />
              </div>

              {/* About Us Description */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-2">
                  <Info size={14} className="text-emerald-400" /> About Us
                </label>
                <textarea 
                  rows="2"
                  value={formData.about}
                  className="w-full px-4 py-3 bg-[#121212] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#333333] transition-all placeholder:text-[#555555] resize-none"
                  placeholder="Tell customers a bit about your establishment..."
                  onChange={(e) => setFormData({...formData, about: e.target.value})}
                />
              </div>

              {/* Brand Palette Color Picker */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-2">
                  <Palette size={14} className="text-emerald-400" /> Dynamic UI Color Accent
                </label>
                <div className="flex items-center gap-4 bg-[#121212] p-3 rounded-xl">
                  <input 
                    type="color"
                    value={formData.primaryColor}
                    className="w-10 h-10 bg-transparent border-none rounded-lg cursor-pointer outline-none"
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  />
                  <div className="text-xs">
                    <p className="font-semibold">{formData.primaryColor.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-500">Buttons and UI elements will match this token layout.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-500 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {loading ? 'Creating Branch...' : 'Next Step: Configure Menu'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}