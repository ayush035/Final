import React, { useState, useEffect } from "react";
import lighthouse from '@lighthouse-web3/sdk';
import Navbar from '@/components/Navbar'

export default function App() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData.total / progressData.uploaded).toFixed(2);
    console.log(percentageDone);
  }

  const uploadFile = async (file) => {
    setFileUploaded(false);
    setError('');

    const output = await lighthouse.upload(file, "f4df0ce0.b658529cf58d41daa6234b73ae5a1ef9", false, null, progressCallback)
    console.log('File Status:', output);

    console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
    setFileName(file[0].name);
    setFileUploaded(true);
  };

  useEffect(() => {
    let timer;
    if (fileUploaded) {
      timer = setTimeout(() => {
        setFileUploaded(false); // Hide the notification after 3 seconds
      }, 3000);
    }
    return () => clearTimeout(timer); // Clear timer when component unmounts or fileUploaded changes
  }, [fileUploaded]);

  return (
    <><Navbar />
    <div className="flex justify-center items-center h-screen">
    <main className='rounded-xl bg-black  text-purple-300 mx-72 outline outline-offset-2 outline-zinc-700 outline-width:8px; shadow-2xl'>
<div className='flex justify-center items-center my-6 mx-4'>
<div className='rounded-2xl bg-black'>
<div className=' text-3xl my-4 mx-8 cursor-pointer font-sans font-semibold'>
Upload Posts</div>
</div>
</div>
<div className=" p-2 mx-8 right flex flex-col">
{/* <form className='px-8' id='upload-form' onSubmit={handleSubmit}> */}
<div className=" p-2 mx-4 right flex flex-col">
{/* <label className='my-2 font-sans text-md font-semibold' htmlFor='token'>Paste your web3.storage API token here</label> */}
{/* <input className='text-black px-8 flex w-10/12' type='password' id='token' onChange={e => setToken(e.target.value)} required /> */}
<label className='my-2 font-sans text-md font-semibold' htmlFor='filepicker'>Pick files to store</label>
<div className="App">
      <input type="file" onChange={e => uploadFile(e.target.files)} />
      {fileUploaded && (
        <div className="overlay">
          <div className="notification">
            <div className="text-black font-sans font-semibold">
            Posted! </div>
          </div>
        </div>
      )}
      {error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  <label className='my-2 font-sans text-md font-semibold'>Description</label>
<input className='text-pink-500 rounded-md px-8 flex w-10/12 outline outline-offset-2 outline-zinc-700 outline-width:4px; ' type='text' placeholder='Hey,there!'/>
<div className='flex justify-center items-center my-4 mx-6'>
<div className='rounded-2xl bg-purple-400 outline outline-offset-2 outline-zinc-700 outline-width:4px hover:bg-white'>
<div className=' text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold text-white hover:text-black hover:bg-white'>
<input className="px-8 my-2 cursor-pointer" type='submit' value='Post' id='submit' />
</div>
</div>
</div>
<div className='flex justify-center items-center my-4 mx-6'>
<div className='rounded-2xl bg-zinc-800 outline outline-offset-2 outline-zinc-700 outline-width:4px'>
<div className=' text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold text-white hover:text-purple-300'>
<input className="px-8 my-2 cursor-pointer" type='submit' value='Mint as a NFT' id='submit' />
</div>
</div>
</div>
</div>
</div>
</main>
</div>
<div id='output'></div>
</>
  )
}
