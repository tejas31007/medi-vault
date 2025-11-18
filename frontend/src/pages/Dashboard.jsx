import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import QuantumGraph from '../components/QuantumGraph';
import { Shield, Upload, Activity, Lock, AlertTriangle, Wifi, Server, LogOut, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [serverStatus, setServerStatus] = useState("Connecting...");
  const [quantumKey, setQuantumKey] = useState("NOT GENERATED");
  const [wsStatus, setWsStatus] = useState("Initializing...");
  const [qber, setQber] = useState(0);
  const [hackerMode, setHackerMode] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/check")
      .then(res => res.json())
      .then(data => setServerStatus(data.status))
      .catch(() => setServerStatus("OFFLINE"));

    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.onopen = () => setWsStatus("Connected");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "initializing") {
        setWsStatus(data.message);
      } else if (data.status === "complete") {
        setWsStatus("Analysis Complete");
        setQuantumKey(data.key);
        setQber(data.qber);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const generateKey = () => {
    if (socket) {
      setWsStatus("Sending Photons...");
      socket.send(JSON.stringify({ action: "START_KEY_GEN", hacker: hackerMode }));
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (qber > 10) {
      alert("⛔ CRITICAL SECURITY ALERT! \n\nEavesdropper detected.");
      event.target.value = null; 
      return;
    }
    if (quantumKey === "NOT GENERATED") {
      alert("⚠️ Please generate a Quantum Key first.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      if (response.ok) alert(`Success! File Encrypted & Uploaded.`);
      else alert("❌ Server rejected upload.");
    } catch (error) {
      alert("❌ Network Error.");
    }
  };

  const isSecure = qber < 5; 

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isSecure ? "bg-slate-50 text-slate-800" : "bg-slate-900 text-white"}`}>
      <nav className={`px-8 py-4 flex justify-between items-center border-b ${isSecure ? "bg-white border-slate-200" : "bg-slate-800/50 border-red-900/30"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSecure ? "bg-blue-100 text-blue-600" : "bg-red-500/20 text-red-500"}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Medi-Vault <span className="font-normal opacity-50">| Secure Portal</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${isSecure ? "bg-slate-100 border-slate-200" : "bg-red-900/20 border-red-500/30"}`}>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Simulation Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={hackerMode} onChange={() => setHackerMode(!hackerMode)} />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
           </div>

          <Link to="/" className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition">
            <LogOut className="w-4 h-4" /> Logout
          </Link>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-6">
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className={`p-6 rounded-2xl border shadow-sm transition-all ${isSecure ? "bg-white border-slate-200" : "bg-slate-800 border-red-500/30 shadow-red-900/20"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wifi className="w-5 h-5 opacity-50" /> Quantum Channel Status
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${isSecure ? "bg-green-100 text-green-700" : "bg-red-500/20 text-red-400 animate-pulse"}`}>
                {isSecure ? "SECURE LINK" : "COMPROMISED"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-bold uppercase opacity-50 mb-1 block">Session Key (BB84)</label>
                <div className={`font-mono text-xs p-4 rounded-lg break-all border transition-all ${isSecure ? "bg-slate-900 text-emerald-400 border-slate-800" : "bg-red-950/30 text-red-400 border-red-500/30"}`}>
                   {quantumKey === "NOT GENERATED" ? <span className="opacity-30">Waiting for photon transmission...</span> : quantumKey}
                </div>
                <div className="absolute right-3 top-9">
                   {wsStatus === "Sending Photons..." && <Activity className="w-4 h-4 text-blue-400 animate-spin" />}
                </div>
              </div>

              <button 
                onClick={generateKey}
                disabled={!isSecure && quantumKey !== "NOT GENERATED"}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg ${isSecure ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
              >
                <Lock className="w-4 h-4" /> Generate New Quantum Key
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl border shadow-sm ${isSecure ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}
          >
             <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 opacity-50" /> Medical Record Upload
             </h2>

             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
             
             <div 
               onClick={() => isSecure && fileInputRef.current.click()}
               className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group
                 ${isSecure ? "border-slate-300 hover:border-blue-500 hover:bg-blue-50/50" : "border-red-900/30 bg-red-950/10 cursor-not-allowed"}`}
             >
                <div className={`p-3 rounded-full ${isSecure ? "bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform" : "bg-red-900/20 text-red-500"}`}>
                  {isSecure ? <Upload className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="text-center">
                   <p className={`font-medium ${isSecure ? "text-slate-700" : "text-red-400"}`}>
                     {isSecure ? "Click to Upload Patient File" : "Transmission Blocked"}
                   </p>
                   <p className="text-xs opacity-50 mt-1">Supports: .PNG, .PDF, .DICOM (X-Ray)</p>
                </div>
             </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 space-y-6">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className={`p-6 rounded-2xl border shadow-sm h-full ${isSecure ? "bg-white border-slate-200" : "bg-slate-800 border-red-500/30"}`}
           >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 opacity-50" /> Live Telemetry
              </h2>

              <div className="mb-6 bg-black rounded-xl overflow-hidden shadow-inner border border-slate-700">
                 <QuantumGraph isHackerActive={hackerMode} />
              </div>

              <div className="space-y-4">
                 <div className={`p-4 rounded-xl border ${isSecure ? "bg-slate-50 border-slate-200" : "bg-red-950/10 border-red-900/30"}`}>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold uppercase opacity-50">QBER (Bit Error Rate)</span>
                       <span className={`text-2xl font-mono font-bold ${isSecure ? "text-emerald-500" : "text-red-500"}`}>{qber}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
                       <div 
                         className={`h-2 rounded-full transition-all duration-700 ${isSecure ? "bg-emerald-500" : "bg-red-500"}`}
                         style={{ width: `${Math.min(qber * 3, 100)}%` }}
                       ></div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${isSecure ? "bg-slate-50 border-slate-200" : "bg-slate-800 border-slate-700"}`}>
                       <div className="text-xs font-bold uppercase opacity-50 mb-1">Protocol</div>
                       <div className="font-mono text-blue-500 font-semibold">BB84</div>
                    </div>
                    <div className={`p-3 rounded-xl border ${isSecure ? "bg-slate-50 border-slate-200" : "bg-slate-800 border-slate-700"}`}>
                       <div className="text-xs font-bold uppercase opacity-50 mb-1">Backend</div>
                       <div className={`font-mono font-semibold flex items-center gap-2 ${serverStatus.includes("OFFLINE") ? "text-red-500" : "text-green-500"}`}>
                          <Server className="w-3 h-3" /> {serverStatus === "Quantum Server is Online" ? "Online" : "Offline"}
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;