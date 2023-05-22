import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import Ethers from '../utils/ethers';
import React from 'react';

import { ThreeDots } from 'react-loader-spinner';

function Component() {
  const [input, setInput] = useState({ x: '', y: '' , ans: ''});
  const [rnd, setRnd] = useState('');
  const [pending, setPending] = useState(false);
  const [proof, setProof] = useState(null);
  const [verification, setVerification] = useState(false);

  // Handles input state
  const handleChange = e => {
    e.preventDefault();
    setInput({ ...input, [e.target.name]: e.target.value, ans: rnd });
  };

  // Calculates proof
  const calculateProof = async () => {
    // only launch if we do have an acir to calculate the proof from
    // set a pending state to show a spinner
    setPending(true);

    if (input.x == "" || input.y == "") {
      toast.error('Fields can not be empty!');
      setPending(false);
    } else {
      
      // launching a new worker for the proof calculation
    const worker = new Worker(new URL('../utils/prover.ts', import.meta.url));

    // handling the response from the worker
    worker.onmessage = e => {
      if (e.data instanceof Error) {
        toast.error('Error while calculating proof');
        setPending(false);
      } else {
        toast.success('Proof calculated');
        setProof(e.data);
        setPending(false);
      }
    };

    // sending the acir and input to the worker
    worker.postMessage({ input });
    }
};

  const verifyProof = async () => {
    // only launch if we do have an acir and a proof to verify
    if (proof) {
      // launching a new worker for the verification
      const worker = new Worker(new URL('../utils/verifier.ts', import.meta.url));
      console.log('worker launched');

      // handling the response from the worker
      worker.onmessage = async e => {
        if (e.data instanceof Error) {
          toast.error('Error while verifying proof');
        } else {
          toast.success('Proof verified');

          // Verifies proof on-chain
          const ethers = new Ethers();
          const ver = await ethers.contract.verify(proof);
          if (ver) {
            toast.success('Proof verified on-chain!');
            setVerification(true);
          } else {
            toast.error('Proof failed on-chain verification');
            setVerification(false);
          }
        }
      };

      // sending the acir and proof to the worker
      worker.postMessage({ proof });
    }
  };

  // Verifier the proof if there's one in state
  useEffect(() => {
    let rndNum = Math.floor((Math.random() * 99) + 1);
    setRnd(rndNum.toString())
    setInput({ ...input, x : '', y: ''});

    if (proof) {
      verifyProof();
    }
  }, [proof]);

  useEffect(() => {
    new Ethers();
  }, []);

  // Shows verification result
  useEffect(() => {
    if (verification) {
      toast.success('Proof verified!');
    }
  }, [verification]);

  return (
    <div className="flex flex-col items-center font-mono ">
      <div className='p-14 mt-24 border-2 border-black text-center bg-white rounded-br-[150px] rounded-t-xl rounded-bl-xl shadow-2xl'>
        <div>
          <h1 className='text-3xl font-bold'>Noir Game</h1>
          <h2 className='text-xl py-5'>This circuit proofs that addition of X and Y equals Z</h2>
          <p>Try it!</p>
        </div>

        <div className='flex flex-row justify-evenly pt-10'>
          <input className='bg-gray-200 w-20 h-20 text-5xl text-center focus:outline-none' name="x" type={'text'} onChange={handleChange} value={input.x} />
          <span className='text-6xl'>+</span>
          <input className='bg-gray-200 w-20 h-20 text-5xl text-center focus:outline-none' name="y" type={'text'} onChange={handleChange} value={input.y} />
          <span className='text-6xl'>=</span>
          <input className='bg-black w-20 h-20 text-5xl text-center text-white' name="ans" disabled={true} type={'text'} onChange={handleChange} value={rnd} />
        </div>
          <div className='flex justify-center h-24 '>
            {pending && <ThreeDots wrapperClass="spinner" color="#000000" height={100} width={100} />}
          </div>
          <div className='w-full pb-5' >
            <button className='text-white shadow-3xl py-3 w-[80%] rounded-br-[200px] rounded-tl-3xl rounded-bl-3xl bg-gradient-to-r from-neutral-950 via-indigo-950 to-purple-900 hover:bg-gradient-to-l' onClick={calculateProof}>Calculate proof</button>
          </div>

      </div>
      
    </div>
  );
}

export default Component;
