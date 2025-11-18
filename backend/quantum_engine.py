from qiskit import QuantumCircuit # type: ignore
from qiskit_aer import AerSimulator # type: ignore
import numpy as np # type: ignore

def generate_bb84_key(num_bits=100, intercept=False):
    """
    Simulates BB84 with optional Eavesdropper (Eve).
    If intercept=True, Eve measures qubits in the middle.
    """
    
    # 1. ALICE PREPARES
    alice_bits = np.random.randint(2, size=num_bits)
    alice_bases = np.random.randint(2, size=num_bits)
    
    qc = QuantumCircuit(num_bits, num_bits)

    for i in range(num_bits):
        if alice_bits[i] == 1:
            qc.x(i)
        if alice_bases[i] == 1:
            qc.h(i)

    # ==========================================
    # 2. THE HACKER ATTACK (EVE)
    # ==========================================
    if intercept:
        # Eve doesn't know the bases, so she guesses randomly
        eve_bases = np.random.randint(2, size=num_bits)
        
        for i in range(num_bits):
            # Eve intercepts and measures
            if eve_bases[i] == 1:
                qc.h(i)
            
            # This MEASUREMENT collapses the state!
            # The qubit is now "broken" relative to Alice's original intent
            qc.measure(i, i)
            
            # Eve must resend the photon to Bob (trying to hide)
            # But the damage is done. She prepares a new photon based on her measurement.
            # (In this simple simulation, the measurement gate already modified the state 
            # passed to Bob in the circuit flow, so we just proceed).

    # ==========================================
    # 3. BOB MEASURES
    # ==========================================
    bob_bases = np.random.randint(2, size=num_bits)
    for i in range(num_bits):
        if bob_bases[i] == 1:
            qc.h(i)
        qc.measure(i, i)

    # 4. RUN SIMULATION
    simulator = AerSimulator()
    result = simulator.run(qc, shots=1, memory=True).result()
    measurements = result.get_memory()[0]
    bob_results = [int(bit) for bit in measurements[::-1]]

    # 5. SIFTING & ERROR CHECK
    shared_key = []
    errors = 0
    matching_bases_count = 0
    
    for i in range(num_bits):
        if alice_bases[i] == bob_bases[i]:
            matching_bases_count += 1
            shared_key.append(bob_results[i])
            
            # CHECK FOR ERRORS
            # If no hacker, Alice's Bit should ALWAYS equal Bob's Result.
            # If there IS a hacker, they might not match.
            if alice_bits[i] != bob_results[i]:
                errors += 1
            
    # Calculate Error Rate (QBER)
    # Avoid division by zero
    error_rate = (errors / matching_bases_count * 100) if matching_bases_count > 0 else 0
    
    final_key_str = ''.join(map(str, shared_key))
    
    return {
        "key": final_key_str,
        "error_rate": round(error_rate, 2) # e.g., 24.5%
    }