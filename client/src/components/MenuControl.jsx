import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, LayoutGrid, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function MenuControl({ restaurantId }) {
  const [categories, setCategories] = useState(['Appetizers', 'Main Course', 'Desserts', 'Drinks']);
  const [newCategory, setNewCategory] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  
  // Clean initialization state containing all schema keys to avoid validation drops
  const [itemForm, setItemForm] = useState({ 
    name: '', 
    price: '', 
    category: 'Appetizers', 
    description: '', 
    imageUrl: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // FIXED: Point to Render in Production!
  const getBackendUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }
    return 'https://swiftserve-saas.onrender.com';
  };

  // Synchronize current menu records index catalog out of the backend cluster
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${getBackendUrl()}/api/menu/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data?.items) setMenuItems(res.data.items);
        // Sync any unique categories already written inside database records dynamically
        if (res.data?.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          setItemForm(prev => ({ ...prev, category: res.data.categories[0] }));
        }
      } catch (e) {
        console.error("Failed to parse catalog records:", e);
        setError('Could not load current registry inventory.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [restaurantId]);

  // Handle addition of custom local grouping categories
  const handleAddCategory = (e) => {
    e.preventDefault();
    const cleanCat = newCategory.trim();
    if (!cleanCat || categories.includes(cleanCat)) return;
    
    setCategories([...categories, cleanCat]);
    setNewCategory('');
    // Automatically pivot form selection target option over to the newly introduced group label
    setItemForm(prev => ({ ...prev, category: cleanCat }));
  };

  // Submit product dataset straight down to backend controllers
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${getBackendUrl()}/api/menu/${restaurantId}/item`, itemForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMenuItems(prev => [...prev, res.data.data]);
        // Reset form variables cleanly back onto base starting points
        setItemForm({ 
          name: '', 
          price: '', 
          category: categories[0] || 'Appetizers', 
          description: '', 
          imageUrl: '' 
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Database rejected product record allocation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
      <Loader2 size={16} className="animate-spin text-emerald-400" />
      <span>Loading catalog allocations...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* 1. MANAGEMENT SECTION: CATALOG GROUPS DEFINITION */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-5">
        <label className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mb-3 uppercase tracking-wider">
          <LayoutGrid size={14} className="text-emerald-400" /> Catalog Class Categories
        </label>
        <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
          <input 
            type="text" 
            placeholder="Add custom group category (e.g., Croissants)" 
            value={newCategory}
            className="flex-1 px-4 py-2 bg-[#121212] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-white/10"
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-200 transition">
            Inject
          </button>
        </form>
      </div>

      {/* 2. MANAGEMENT LAYOUT SECTION: SPLIT FORMS PANEL CONTAINER */}
      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* SUB-PANEL LEFT SIDE: CREATION UTILITY SLOTS */}
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 h-fit">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-5 flex items-center gap-1.5">
            <Plus size={14} className="text-emerald-400" /> Stock Product Parameters
          </h3>
          
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <input 
                type="text" 
                required 
                placeholder="Item Title Name" 
                value={itemForm.name} 
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-white/10" 
                onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
              />
            </div>

            <div>
              <input 
                type="number" 
                step="0.01" 
                required 
                placeholder="Price ($)" 
                value={itemForm.price} 
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-white/10" 
                onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
              />
            </div>

            <div>
              <select 
                value={itemForm.category} 
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-xs text-slate-300 outline-none focus:border-white/10" 
                onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
              >
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <textarea 
                placeholder="Description or exquisite ingredients note (optional)..." 
                value={itemForm.description} 
                rows="3"
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-xs text-white outline-none resize-none focus:border-white/10" 
                onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
              />
            </div>

            <div>
              <input 
                type="url" 
                placeholder="Product Image Asset Link URL (optional)..." 
                value={itemForm.imageUrl} 
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-white/10" 
                onChange={(e) => setItemForm({...itemForm, imageUrl: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {saving ? 'Saving allocation...' : 'Commit to Database'}
            </button>
          </form>
        </div>

        {/* SUB-PANEL RIGHT SIDE: REGISTRY INDEX VIEWER */}
        <div className="lg:col-span-3 bg-[#0d0d0d] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">
            Active Registry Index ({menuItems.length})
          </h3>
          
          {menuItems.length === 0 ? (
            <p className="text-xs text-slate-600 py-6 text-center">No catalog allocations written to this branch yet.</p>
          ) : (
            <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
              {menuItems.map((item) => (
                <div key={item._id || item.id} className="flex items-center justify-between py-3.5 group animate-fadeIn">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-white/5" />
                    ) : (
                      <div className="w-10 h-10 bg-[#121212] border border-white/5 flex items-center justify-center rounded-lg text-sm">🍽️</div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">${parseFloat(item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}