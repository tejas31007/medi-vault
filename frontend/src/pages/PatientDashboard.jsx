import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import QuantumGraph from '../components/QuantumGraph';
import { Shield, Download, FileText, Lock, Activity, CheckCircle, Key, LogOut, Server, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
  const [files, setFiles] = useState([]);
  const [quantumKey, setQuantumKey] = useState("WAITING FOR PHOTONS...");
  const [qber, setQber] = useState(0);
  const [wsStatus, setWsStatus] = useState("Connecting to Quantum Channel...");
  const [downloading, setDownloading] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(err => console.error(err));

    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    ws.onopen = () => setWsStatus("Channel Active - Listening");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "initializing") {
        setWsStatus("Detecting Incoming Photons...");
      } else if (data.status === "complete") {
        setWsStatus("Photons Measured. Key Reconstructed.");
        setQuantumKey(data.key);
        setQber(data.qber);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleDownload = (filename) => {
    if (quantumKey === "WAITING FOR PHOTONS...") {
      alert("⛔ ACCESS DENIED. \n\nYou do not have the Quantum Key to decrypt this file.\nAsk the Doctor to initiate the Quantum Handshake.");
      return;
    }

    if (qber > 10) {
        alert(`⛔ SECURITY WARNING!\n\nDecryption Blocked.\n\nThe Quantum Key is corrupted (QBER: ${qber}%). This indicates an eavesdropper (Eve) intercepted the transmission.\n\nRequest a new key from the Doctor.`);
        return;
    }

    setDownloading(filename);
    
    setTimeout(() => {
      window.open(`http://127.0.0.1:8000/download/${filename}`, '_blank');
      setDownloading(null);
      alert(`✅ Key Matched (QBER: ${qber}%). File decrypted securely.`);
    }, 1500);
  };

  const isSecure = qber < 10;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-700 ${isSecure ? "bg-slate-900 text-white" : "bg-slate-900 text-red-50"}`}>
      <nav className={`px-8 py-4 flex justify-between items-center border-b backdrop-blur-md sticky top-0 z-50 ${isSecure ? "border-emerald-900/30 bg-slate-800/50" : "border-red-900/50 bg-red-950/30"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSecure ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-500"}`}>
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Medi-Vault <span className="font-normal opacity-50">| Patient Portal</span></h1>
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition">
          <LogOut className="w-4 h-4" /> Logout
        </Link>
      </nav>

      <main className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-2xl border shadow-lg transition-all ${isSecure ? "border-emerald-500/20 bg-slate-800/50 shadow-emerald-900/10" : "border-red-500/50 bg-red-900/10 shadow-red-900/20"}`}
          >
            <h2 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${isSecure ? "text-emerald-400" : "text-red-400"}`}>
              {isSecure ? <Activity className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              Receiver Node (Bob)
            </h2>
            
            {/* Graph showing "Reception" */}
            <div className="h-32 mb-4 bg-black rounded-lg border border-slate-700 overflow-hidden relative">
               <QuantumGraph isHackerActive={!isSecure && qber > 0} /> 
               <div className={`absolute bottom-2 right-2 text-[10px] font-mono ${isSecure ? "text-emerald-500" : "text-red-500 animate-pulse"}`}>
                 {isSecure ? "SIGNAL CLEAN" : "INTERFERENCE DETECTED"}
               </div>
            </div>

            <div className="space-y-4">
              {/* Key Display */}
              <div>
                <div className="text-xs font-bold uppercase opacity-50 mb-1">Decryption Key Status</div>
                <div className={`font-mono text-xs p-3 rounded border break-all transition-all 
                    ${quantumKey.includes("WAITING") ? "bg-slate-900 border-slate-700 text-slate-500" : 
                      isSecure ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400" : "bg-red-950/30 border-red-500/50 text-red-400"}`}>
                  {quantumKey === "WAITING FOR PHOTONS..." ? "Awaiting Transmission..." : quantumKey}
                </div>
              </div>

              {/* QBER Display */}
              <div className={`p-3 rounded border ${isSecure ? "border-emerald-500/20 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase opacity-70">Bit Error Rate (QBER)</span>
                    <span className={`font-mono font-bold ${isSecure ? "text-emerald-400" : "text-red-500"}`}>{qber}%</span>
                 </div>
                 {!isSecure && <div className="text-[10px] text-red-400 mt-1 font-bold">⚠️ CRITICAL: KEY COMPROMISED</div>}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
               <Server className="w-3 h-3" /> {wsStatus}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: INBOX */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border transition-all ${isSecure ? "border-slate-700 bg-slate-800/30" : "border-red-900/30 bg-red-950/10"}`}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
               <FileText className="w-5 h-5 text-blue-400" /> Secure Inbox
            </h2>

            {files.length === 0 ? (
              <div className="text-center p-10 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                No secure documents found.
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 border rounded-xl transition group ${isSecure ? "bg-slate-800 border-slate-700 hover:border-emerald-500/30" : "bg-slate-800/50 border-red-900/30"}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <Lock className={`w-5 h-5 ${isSecure ? "text-emerald-500" : "text-red-500"}`} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{file.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                           <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">AES-256</span>
                           <span>{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDownload(file.name)}
                      disabled={downloading === file.name}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                        ${quantumKey.includes("WAITING") 
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                          : isSecure 
                             ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                             : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"}`}
                    >
                      {downloading === file.name ? (
                        <>Decrypting...</> 
                      ) : (
                        <>
                          {quantumKey.includes("WAITING") ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                          {quantumKey.includes("WAITING") ? "Locked" : "Decrypt"}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

      </main>
    </div>
  );
};

export default PatientDashboard;