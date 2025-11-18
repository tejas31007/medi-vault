import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('doctor');

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden relative">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-500/20 rounded-full ring-1 ring-blue-400/50">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">Medi-Vault</h2>
        <p className="text-center text-slate-400 text-sm mb-8">Quantum-Secured Medical Portal</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Select Identity</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-800/50 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="doctor">Dr. Sarah Connor (Oncologist)</option>
                <option value="patient">Patient (Read Only)</option>
              </select>
              <Activity className="absolute right-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-500 hover:to-indigo-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            Authenticate Session
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;