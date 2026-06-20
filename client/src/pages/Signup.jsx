import { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password
      };

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/home';
    } catch (err) {
      alert("Signup failed: " + (err.response?.data?.error || "Error"));
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white font-sans animate-fadeIn">
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 gap-4">
        
        {/* LEFT PANEL: The Green Gradient Background */}
        <div className="hidden md:flex md:w-1/2 rounded-[2rem] bg-gradient-to-br from-[#113d2f] via-[#0b261d] to-[#05100c] p-12 flex-col justify-center relative overflow-hidden group">
          {/* Soft glowing orb effect - adds a subtle pulse on panel hover */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_20%,rgba(52,211,153,0.1),transparent_60%)] transition-opacity duration-700 group-hover:opacity-70 opacity-100"></div>
          
          <div className="relative z-10 max-w-md">
            <h1 className="text-5xl font-semibold mb-6 leading-tight transition-transform duration-500 ease-out translate-y-0 hover:-translate-y-1">
              Get Started <br /> with Us
            </h1>
            <div className="flex items-center gap-6 mb-16">
              <p className="text-[#a0bba8] text-sm leading-relaxed">
                Complete these easy steps <br /> to register your account.
              </p>
            </div>

            {/* Step Indicators with lift & glow micro-interactions */}
            <div className="flex gap-4">
              {/* Step 1: Active */}
              <div className="flex-1 p-5 rounded-2xl bg-white text-slate-900 shadow-xl hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out cursor-default">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold mb-3 transition-transform duration-300 hover:scale-110 hover:bg-slate-800">
                  1
                </div>
                <p className="text-sm font-semibold leading-snug">Sign up your<br/>account</p>
              </div>
              
              {/* Step 2: Inactive */}
              <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/5 text-white/50 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-1 hover:text-white/80 transition-all duration-300 ease-out cursor-default">
                <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold mb-3 transition-colors duration-300">
                  2
                </div>
                <p className="text-sm font-medium leading-snug">Set up your<br/>workspace</p>
              </div>

              {/* Step 3: Inactive */}
              <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/5 text-white/50 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-1 hover:text-white/80 transition-all duration-300 ease-out cursor-default">
                <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold mb-3 transition-colors duration-300">
                  3
                </div>
                <p className="text-sm font-medium leading-snug">Set up your<br/>profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: The Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="w-full max-w-[400px]">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Sign Up Account</h2>
              <p className="text-[#888888] text-xs">Enter your personal data to create your account.</p>
            </div>

            {/* Social Logins with press scaling and border glow */}
            <div className="flex gap-4 mb-8">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#222222] hover:bg-[#111111] hover:border-[#444] active:scale-[0.97] transition-all duration-200 ease-out text-sm font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#222222] hover:bg-[#111111] hover:border-[#444] active:scale-[0.97] transition-all duration-200 ease-out text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Github
              </button>
            </div>

            <div className="flex items-center mb-8">
              <div className="flex-1 h-px bg-[#222222]"></div>
              <span className="px-4 text-[11px] text-[#666666]">Or</span>
              <div className="flex-1 h-px bg-[#222222]"></div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              
              {/* Form Inputs with focus rings and hover background shifts */}
              <div className="flex gap-4">
                <div className="flex-1 group">
                  <label className="block text-[11px] font-medium text-[#aaaaaa] mb-2 group-focus-within:text-white transition-colors">First Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-[#121212] border border-transparent rounded-xl text-sm outline-none hover:bg-[#161616] focus:bg-[#181818] focus:border-[#333] focus:ring-4 focus:ring-white/5 transition-all duration-300 placeholder:text-[#555555]"
                    placeholder="eg. John"
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="flex-1 group">
                  <label className="block text-[11px] font-medium text-[#aaaaaa] mb-2 group-focus-within:text-white transition-colors">Last Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-[#121212] border border-transparent rounded-xl text-sm outline-none hover:bg-[#161616] focus:bg-[#181818] focus:border-[#333] focus:ring-4 focus:ring-white/5 transition-all duration-300 placeholder:text-[#555555]"
                    placeholder="eg. Francisco"
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-2 group-focus-within:text-white transition-colors">Email</label>
                <input 
                  required
                  type="email"
                  className="w-full px-4 py-3 bg-[#121212] border border-transparent rounded-xl text-sm outline-none hover:bg-[#161616] focus:bg-[#181818] focus:border-[#333] focus:ring-4 focus:ring-white/5 transition-all duration-300 placeholder:text-[#555555]"
                  placeholder="eg. johnfrans@gmail.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="group">
                <label className="block text-[11px] font-medium text-[#aaaaaa] mb-2 group-focus-within:text-white transition-colors">Password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-4 pr-12 py-3 bg-[#121212] border border-transparent rounded-xl text-sm outline-none hover:bg-[#161616] focus:bg-[#181818] focus:border-[#333] focus:ring-4 focus:ring-white/5 transition-all duration-300 placeholder:text-[#555555]"
                    placeholder="Enter your password"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-[#555555] hover:text-white active:scale-75 transition-all duration-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-[#666666]">Must be at least 8 characters.</p>
              </div>

              {/* White Sign Up Button with lift, glow, and press effect */}
              <button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-slate-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ease-out mt-6"
              >
                Sign Up
              </button>
            </form>

            <p className="text-center mt-8 text-[11px] text-[#888888]">
              Already have an account? <Link to="/login" className="text-white font-semibold hover:text-[#a0bba8] transition-colors duration-200 hover:underline">Log in</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}