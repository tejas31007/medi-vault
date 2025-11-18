from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np

def generate_bb84_key(num_bits=100, intercept=False):
    """
    Simulates BB84 with optional Eavesdropper (Eve).
    If intercept=True, Eve measures qubits in the middle.
    """
    alice_bits = np.random.randint(2, size=num_bits)
    alice_bases = np.random.randint(2, size=num_bits)
    
    qc = QuantumCircuit(num_bits, num_bits)

    for i in range(num_bits):
        if alice_bits[i] == 1:
            qc.x(i)
        if alice_bases[i] == 1:
            qc.h(i)

    if intercept:
        eve_bases = np.random.randint(2, size=num_bits)
        
        for i in range(num_bits):
            if eve_bases[i] == 1:
                qc.h(i)
            qc.measure(i, i)

    bob_bases = np.random.randint(2, size=num_bits)
    for i in range(num_bits):
        if bob_bases[i] == 1:
            qc.h(i)
        qc.measure(i, i)

    simulator = AerSimulator()
    result = simulator.run(qc, shots=1, memory=True).result()
    measurements = result.get_memory()[0]
    bob_results = [int(bit) for bit in measurements[::-1]]

    shared_key = []
    errors = 0
    matching_bases_count = 0
    
    for i in range(num_bits):
        if alice_bases[i] == bob_bases[i]:
            matching_bases_count += 1
            shared_key.append(bob_results[i])
            
            if alice_bits[i] != bob_results[i]:
                errors += 1
            
    error_rate = (errors / matching_bases_count * 100) if matching_bases_count > 0 else 0
    
    final_key_str = ''.join(map(str, shared_key))
    
    return {
        "key": final_key_str,
        "error_rate": round(error_rate, 2)
    }