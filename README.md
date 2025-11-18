# 🏥 Medi-Vault: Quantum-Secure Medical Transfer

> **"Harvest Now, Decrypt Later" Defense System**

Medi-Vault is a Zero-Trust file transfer portal designed to protect sensitive medical records (Genomic data, X-Rays) from future quantum computing threats. It utilizes a simulation of the **BB84 Quantum Key Distribution (QKD)** protocol to generate entropy-based encryption keys.

![Project Status](https://img.shields.io/badge/Status-Prototype_Complete-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_FastAPI_Qiskit-blue)

## 🌟 Key Features

- **⚛️ Quantum Key Simulation:** Uses IBM Qiskit to simulate photon polarization states (0°, 45°, 90°) for key generation.
- **🕵️ Hacker Detection (Eavesdropper):** Real-time detection of "Man-in-the-Middle" attacks. If the **Quantum Bit Error Rate (QBER)** spikes >10%, the system locks down.
- **📉 Live Telemetry:** Visualizes the photon stream and error rates using Recharts and WebSockets.
- **🔐 Hybrid Encryption:** Combines Quantum Key Distribution (Physics) with AES-256 (Math) for layered security.

## 🛠️ Tech Stack

| Domain | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React.js + Tailwind CSS | Doctor/Patient Dashboard, Glassmorphism UI |
| **Backend** | Python FastAPI | REST API, WebSocket Manager |
| **Quantum** | IBM Qiskit + NumPy | Simulating Superposition & Measurement Collapse |
| **Security** | AES-GCM + BB84 Logic | Payload Encryption & Forward Secrecy |

## 🚀 How to Run Locally

**1. Clone the Repo**
```bash
git clone [https://github.com/YOUR_USERNAME/medi-vault.git](https://github.com/YOUR_USERNAME/medi-vault.git)
cd medi-vault