import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, QrCode, Smartphone, ChefHat } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 lg:px-12 py-6 relative z-20">
        <div className="flex items-center gap-2 text-white font-semibold text-2xl tracking-tighter">
          <UtensilsCrossed className="text-emerald-400" size={28} strokeWidth={2.5} /> 
          SwiftServe
        </div>
        <div className="flex gap-6 items-center font-medium text-sm">
          <Link to="/login" className="text-slate-300 hover:text-white transition">Log In</Link>
          <Link to="/signup" className="bg-white text-black px-5 py-2.5 rounded-full font-semibold hover:bg-slate-200 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        
        {/* Background Glowing Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          
          {/* Pulse Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Next-Gen QR Ordering
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold text-white mb-8 leading-tight tracking-tight">
            The smarter way to <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              serve your guests.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#a0bba8] mb-12 max-w-2xl mx-auto leading-relaxed">
            Ditch paper menus. Create a professional, real-time digital experience for your restaurant in under 5 minutes.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-slate-200 transition">
              Start Your Free Trial <ArrowRight size={18} />
            </Link>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition backdrop-blur-sm">
              View Live Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid (Matching the Green Gradient of the Auth pages) */}
      <div className="max-w-7xl mx-auto px-4 pb-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#113d2f] to-[#05100c] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <QrCode className="text-emerald-400 mb-6" size={32} />
            <h3 className="text-xl font-semibold text-white mb-3">Instant QR Menus</h3>
            <p className="text-[#a0bba8] text-sm leading-relaxed">
              Generate unique table codes. Customers scan and order directly from their browsers without downloading any apps.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#113d2f] to-[#05100c] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <ChefHat className="text-emerald-400 mb-6" size={32} />
            <h3 className="text-xl font-semibold text-white mb-3">Live Kitchen Display</h3>
            <p className="text-[#a0bba8] text-sm leading-relaxed">
              Orders appear instantly on your Kitchen Display System (KDS). Manage statuses real-time with WebSockets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#113d2f] to-[#05100c] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <Smartphone className="text-emerald-400 mb-6" size={32} />
            <h3 className="text-xl font-semibold text-white mb-3">Brand Customization</h3>
            <p className="text-[#a0bba8] text-sm leading-relaxed">
              Make it yours. Upload your logo, set your brand colors, and control your menu availability instantly.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}