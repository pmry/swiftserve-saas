import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, DollarSign, PlusCircle, LayoutGrid, Utensils, Smartphone, ArrowLeft, Eye } from 'lucide-react';

export default function MenuSetup() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default Categories list
  const [categories, setCategories] = useState(['Appetizers', 'Main Course', 'Desserts', 'Drinks']);
  const [newCategory, setNewCategory] = useState('');
  const [activePreviewCategory, setActivePreviewCategory] = useState('Appetizers');

  // Menu items list state
  const [menuItems, setMenuItems] = useState([]);
  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    category: 'Appetizers',
    description: '',
    imageUrl: ''
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      setError('Category already exists.');
      return;
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    setError('');
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) {
      setError('Item Name and Price are required.');
      return;
    }
    setMenuItems([...menuItems, { ...itemForm, id: Date.now() }]);
    setItemForm({
      name: '',
      price: '',
      category: itemForm.category, // keep selected category
      description: '',
      imageUrl: ''
    });
    setError('');
  };

  const handleRemoveItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleFinishSetup = async () => {
    if (menuItems.length === 0) {
      setError('Please add at least one item to deploy your digital restaurant menu.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/menu/${restaurantId}/batch`, {
        items: menuItems,
        categories: categories
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save menu allocations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 gap-4">
        
        {/* LEFT PANEL: Live Interactive Menu Preview (Simulated Phone View) */}
        <div className="hidden lg:flex md:w-[40%] rounded-[2rem] bg-gradient-to-br from-[#113d2f] via-[#0b261d] to-[#05100c] p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_20%,rgba(52,211,153,0.1),transparent_60%)]"></div>
          
          <div className="relative z-10 w-full max-w-xs mx-auto flex flex-col h-full justify-between">
            <div>
              <h2 className="text-3xl font-semibold mb-1 leading-tight flex items-center gap-2">
                <Eye size={24} className="text-emerald-400" /> Digital Menu
              </h2>
              <p className="text-[#a0bba8] text-xs mb-6">Real-time smartphone customer viewport mockup.</p>
            </div>

            {/* Simulated Smartphone Screen container */}
            <div className="w-full bg-[#0d0d0d] border border-white/10 rounded-[2.2rem] h-[460px] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
              
              {/* Internal Mock Header */}
              <div className="p-4 border-b border-white/5 bg-[#121212] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">Our Digital Menu</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">T-04</span>
              </div>

              {/* Mock Horizonal Category List Tabs */}
              <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#0a0a0a]">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewCategory(cat)}
                    className={`text-[10px] font-medium px-3 py-1 rounded-full border transition whitespace-nowrap ${
                      activePreviewCategory === cat
                        ? 'bg-emerald-500 text-black border-emerald-500 font-semibold'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Items View List */}
              <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2 bg-[#0d0d0d]">
                {menuItems.filter(i => i.category === activePreviewCategory).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Utensils size={24} className="text-slate-700 mb-2" />
                    <p className="text-[10px] text-slate-500">No items added to "{activePreviewCategory}" yet.</p>
                  </div>
                ) : (
                  menuItems.filter(i => i.category === activePreviewCategory).map((item) => (
                    <div key={item.id} className="p-2 rounded-xl bg-[#121212] border border-white/5 flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-white/5 flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center border border-white/5 flex-shrink-0 text-slate-600 text-xs">🍽️</div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold truncate text-white">{item.name}</p>
                          <p className="text-[9px] text-slate-400 truncate line-clamp-1">{item.description || 'No item details description.'}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 flex-shrink-0">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Visual Step Tracker indicator bar */}
            <div className="flex gap-4 mt-6 justify-center">
              <span className="w-8 h-1 bg-white/20 rounded-full"></span>
              <span className="w-8 h-1 bg-white/20 rounded-full"></span>
              <span className="w-8 h-1 bg-white rounded-full"></span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Category Creation & Item Buffer Stack Lists */}
        <div className="flex-1 flex flex-col justify-start p-4 md:p-8 lg:p-12 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl mx-auto">
            
            {/* Nav Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6 mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Assemble Menu Layout</h2>
                <p className="text-[#888888] text-xs">Define dynamic category buckets and load inventory parameters.</p>
              </div>
              <button 
                onClick={handleFinishSetup}
                disabled={loading || menuItems.length === 0}
                className="bg-white text-black hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                {loading ? 'Processing Setup...' : 'Complete Menu System'}
                <CheckCircle size={14} />
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs mb-6 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>
            )}

            <div className="space-y-6">
              
              {/* SECTION 1: Category Dynamic Injection Engine */}
              <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-3 uppercase tracking-wider">
                  <LayoutGrid size={14} className="text-emerald-400" /> 1. Menu Taxonomy Groups
                </label>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                  <input 
                    type="text"
                    placeholder="Add custom group (eg. Chef Specials, Combos)"
                    value={newCategory}
                    className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs outline-none focus:border-emerald-500/50 text-white"
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button type="submit" className="px-4 bg-white/5 border border-white/5 hover:bg-white/10 text-emerald-400 rounded-xl transition text-xs font-medium cursor-pointer">
                    Add
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, i) => (
                    <span key={i} className="text-[11px] font-medium px-3 py-1.5 bg-[#1a1a1a] rounded-xl border border-white/5 text-slate-300">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Add Menu Item Form */}
              <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
                <label className="flex items-center gap-2 text-[11px] font-medium text-[#aaaaaa] mb-5 uppercase tracking-wider border-b border-white/5 pb-2">
                  <Utensils size={14} className="text-emerald-400" /> 2. Add New Catalog Item
                </label>
                
                <form onSubmit={handleAddItem} className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] tracking-wide font-medium text-slate-400 mb-1.5">Item Title Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="eg. Avocado Toast with Poached Egg"
                      value={itemForm.name}
                      className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs outline-none focus:border-emerald-500/50 text-white"
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-wide font-medium text-slate-400 mb-1.5">Pricing Variant ($)</label>
                    <div className="relative">
                      <DollarSign size={13} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input 
                        required
                        type="number"
                        step="0.01"
                        placeholder="12.00"
                        value={itemForm.price}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs outline-none focus:border-emerald-500/50 text-white"
                        onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-wide font-medium text-slate-400 mb-1.5">Assign To Taxonomy Category</label>
                    <select 
                      value={itemForm.category}
                      className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs outline-none text-white cursor-pointer"
                      onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                    >
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] tracking-wide font-medium text-slate-400 mb-1.5">Image Link URL Asset</label>
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/photo-example..."
                      value={itemForm.imageUrl}
                      className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs outline-none focus:border-emerald-500/50 text-white"
                      onChange={(e) => setItemForm({...itemForm, imageUrl: e.target.value})}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] tracking-wide font-medium text-slate-400 mb-1.5">Short Product Summary / Details</label>
                    <textarea 
                      rows="2"
                      placeholder="Toasted artisan bakery sourdough bread topped with fresh smashed organic avocados, chili flakes, and cage-free soft egg..."
                      value={itemForm.description}
                      className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-xl text-xs outline-none focus:border-emerald-500/50 text-white resize-none"
                      onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button type="submit" className="w-full py-3 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
                      <PlusCircle size={14} /> Buffer New Item to Sandbox List
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 3: Current Staged Buffer List Trash Bin Operations */}
              <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
                <label className="block text-[11px] font-medium text-slate-500 mb-4 uppercase tracking-wider">
                  Staged Catalog Queue ({menuItems.length})
                </label>
                {menuItems.length === 0 ? (
                  <p className="text-slate-600 text-xs text-center py-4">Your current pipeline queue cache is empty.</p>
                ) : (
                  <div className="divide-y divide-white/5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 animate-fadeIn">
                        <div className="flex items-center gap-3 truncate">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-9 h-9 object-cover rounded-lg border border-white/5 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 bg-[#1a1a1a] flex items-center justify-center rounded-lg text-xs border border-white/5 flex-shrink-0">🍲</div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-medium text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.category} &bull; ${parseFloat(item.price).toFixed(2)}</p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}