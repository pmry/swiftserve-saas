import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Grid, CheckCircle2, UserCheck, QrCode, Edit2, Save, X, Loader2, Download, ExternalLink } from 'lucide-react';

export default function TablesControl({ restaurantId }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Sizing Layout States
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [inputCount, setInputCount] = useState('');

  // QR POPUP SYSTEM STATES
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrUrl, setActiveQrUrl] = useState('');
  const [activeQrTable, setActiveQrTable] = useState('');

  const fetchTableMatrix = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentBranch = res.data.data.find(b => b._id === restaurantId);
      
      if (currentBranch) {
        setInputCount(currentBranch.tablesCount || 0);
        // Build active table items array map matching the total configurations count
        const dataGrid = Array.from({ length: currentBranch.tablesCount || 0 }, (_, i) => ({
          id: `tbl-${i + 1}`,
          number: String(i + 1).padStart(2, '0'),
          status: (i + 1) % 3 === 0 ? 'Taken' : 'Empty' // Alternates states organically for visualization previews
        }));
        setTables(dataGrid);
      }
    } catch (err) {
      console.error('Failed to sync floor matrix variables.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableMatrix();
  }, [restaurantId]);

  const handleUpdateTablesCount = async (e) => {
    e.preventDefault();
    const newCount = parseInt(inputCount, 10);
    
    if (isNaN(newCount) || newCount < 0 || newCount > 100) {
      alert('Please enter a valid layout allocation scale between 0 and 100 tables.');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // Patches tablesCount scale variable down to the active restaurant model parameters
      await axios.put(`http://localhost:5000/api/restaurants/${restaurantId}`, 
        { tablesCount: newCount },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setIsEditingCount(false);
      await fetchTableMatrix(); // Force live structural reload mapping triggers immediately
    } catch (err) {
      setError('Database rejected floor grid density updates.');
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to calculate and target customer routing links
  const triggerQrGeneration = (tableNumber) => {
    // Points directly to the Customer Welcome intro gateway landing page
    const targetUrl = `${window.location.origin}/welcome/${restaurantId}?table=${tableNumber}`;
    setActiveQrUrl(targetUrl);
    setActiveQrTable(tableNumber);
    setQrModalOpen(true);
  };

  // Metric Aggregation calculation pipelines
  const totalCount = tables.length;
  const emptyCount = tables.filter(t => t.status === 'Empty').length;
  const takenCount = tables.filter(t => t.status === 'Taken').length;

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
      <Loader2 size={16} className="animate-spin text-emerald-400" />
      <span>Synchronizing shop floor parameters...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* ========================================== */}
      {/* REAL-TIME OPERATION MONITOR METRIC CARDS   */}
      {/* ========================================== */}
      <div className="grid sm:grid-cols-3 gap-4">
        
        {/* CARD 1: TOTAL LAYOUT COUNT WITH INLINE EDIT SYSTEM */}
        <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[110px] relative overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Floor Layout</p>
              
              {!isEditingCount ? (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold font-mono tracking-tight">{totalCount} Tables</p>
                  <button 
                    onClick={() => setIsEditingCount(true)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateTablesCount} className="flex items-center gap-1.5 mt-1 animate-fadeIn">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    disabled={updating}
                    value={inputCount}
                    className="w-16 px-2 py-1 bg-[#141414] border border-white/10 rounded-lg text-sm text-white font-mono outline-none focus:border-emerald-500/50"
                    onChange={(e) => setInputCount(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" disabled={updating} className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition cursor-pointer">
                    <Save size={12} />
                  </button>
                  <button type="button" disabled={updating} onClick={() => { setIsEditingCount(false); setInputCount(totalCount); }} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition cursor-pointer">
                    <X size={12} />
                  </button>
                </form>
              )}
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400"><Grid size={18} /></div>
          </div>
          {error && <p className="text-[9px] text-red-400 mt-2 font-medium">{error}</p>}
        </div>

        {/* CARD 2: VACANT SEATING INDICATORS */}
        <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl flex items-center justify-between min-h-[110px]">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Available States</p>
            <p className="text-2xl font-bold font-mono tracking-tight text-emerald-400">{emptyCount} Empty</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400"><CheckCircle2 size={18} /></div>
        </div>

        {/* CARD 3: OCCUPIED SEATING INDICATORS */}
        <div className="bg-[#0d0d0d] border border-white/5 p-5 rounded-2xl flex items-center justify-between min-h-[110px]">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Active Seating Sessions</p>
            <p className="text-2xl font-bold font-mono tracking-tight text-amber-500">{takenCount} Taken</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500"><UserCheck size={18} /></div>
        </div>
      </div>

      {/* ========================================== */}
      {/* FLOORS SEATING CARDS GRID ARRAY DISPLAY     */}
      {/* ========================================== */}
      {tables.length === 0 ? (
        <div className="p-16 text-center rounded-[2rem] bg-[#0d0d0d] border border-white/5 border-dashed">
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            No active seating coordinates deployed for this branch. Click the edit pencil icon above to configure your shop layout capacity density.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div 
              key={table.id} 
              className="p-5 rounded-2xl bg-gradient-to-br from-[#0d0d0d] to-[#080808] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition ${
                  table.status === 'Taken' 
                    ? 'bg-amber-500/5 text-amber-400 border-amber-500/20 shadow-lg' 
                    : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-lg'
                }`}>
                  {table.number}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Table Node</p>
                  <p className={`text-[9px] font-medium tracking-wide transition ${table.status === 'Taken' ? 'text-amber-500' : 'text-emerald-400'}`}>
                    &bull; {table.status === 'Taken' ? 'Occupied' : 'Vacant'}
                  </p>
                </div>
              </div>

              {/* Triggers live scan popup modal overlay execution */}
              <button 
                onClick={() => triggerQrGeneration(table.number)}
                className="p-2 bg-[#121212] border border-white/5 hover:border-emerald-500/20 text-slate-500 hover:text-emerald-400 rounded-lg transition opacity-60 group-hover:opacity-100 cursor-pointer"
              >
                <QrCode size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* LIVE SCANNABLE QR CODE POPCARD MODAL      */}
      {/* ========================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full relative text-center shadow-2xl">
            <button onClick={() => setQrModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition cursor-pointer">
              <X size={18} />
            </button>
            
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
              Table {activeQrTable} QR Matrix
            </span>
            <h3 className="text-lg font-semibold mt-3 mb-1">Live Seating Endpoint</h3>
            <p className="text-slate-500 text-xs mb-6 max-w-[240px] mx-auto leading-normal">
              Scan using a smartphone camera to instantly access the dynamic welcome layout and interactive menus.
            </p>

            {/* LIVE SCANNABLE VECTOR CONTAINER */}
            <div className="w-48 h-48 bg-white rounded-2xl p-4 mx-auto flex items-center justify-center shadow-inner">
              <QRCodeSVG 
                value={activeQrUrl}
                size={160}
                level={"H"} // High Error correction density protects prints from light damage/scratches
                includeMargin={false}
              />
            </div>

            {/* Action Operations Link Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-4 border-t border-white/5">
              <a 
                href={activeQrUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition text-slate-300"
              >
                Test Link <ExternalLink size={12} />
              </a>
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-950/20"
              >
                Print Matrix
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}