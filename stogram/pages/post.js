import React, { useState, useReducer } from 'react'
import { Web3Storage } from 'web3.storage'
import Navbar from '@/components/Navbar'
import Footer from '../components/Footer'

export default function Home () {
  const [messages, showMessage] = useReducer((msgs, m) => msgs.concat(m), [])
  const [token, setToken] = useState('')
  const [files, setFiles] = useState([])

  async function handleSubmit (event) {
    // don't reload the page!
    event.preventDefault()

    showMessage('Posting')
    const Web_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDUxODdDYTU3ZWU1MEEwOWZmOUI2NDAzMDRiQTlDNEZBOTE3MjlDM0YiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODQ3NzU2NjQ4MjYsIm5hbWUiOiJBeXVzaCJ9.rR03Th49YPmOVoy8n8teXTTImO1P5wz4BxAFDFAb3wM'
    const client = new Web3Storage({ token: Web_STORAGE_TOKEN })
    // const client = new Web3Storage({ token })

    showMessage('> 🤖 chunking and hashing the files (in your browser!) to calculate the Content ID')
    const cid = await client.put(files, {
      onRootCidReady: localCid => {
        showMessage(`> 🔑 locally calculated Content ID: ${localCid} `)
        showMessage('> 📡 sending files to web3.storage ')
      },
      onStoredChunk: bytes => showMessage(` Posted ${bytes.toLocaleString()} `)
    })
    showMessage(`> ✅ web3.storage now hosting ${cid}`)
    showLink(`https://dweb.link/ipfs/${cid}`)

    showMessage('> 📡 fetching the list of all unique uploads on this account')
    let totalBytes = 0
    for await (const upload of client.list()) {
      showMessage(`> 📄 ${upload.cid}  ${upload.name}`)
      totalBytes += upload.dagSize || 0
    }
    showMessage(`> ⁂ ${totalBytes.toLocaleString()} bytes stored!`)
  }

  function showLink (url) {
    showMessage(<span>&gt; 🔗 <a href={url}>{url}</a></span>)
  }

  return (
    <><Navbar />
    <div className="flex justify-center items-center h-screen">
    <main className='rounded-xl bg-black  text-pink-500 mx-72 outline outline-offset-2 outline-pink-300 outline-width:8px; shadow-2xl'>
<div className='flex justify-center items-center my-6 mx-4'>
<div className='rounded-2xl bg-black'>
<div className=' text-3xl my-4 mx-8 cursor-pointer font-sans font-semibold'>
Upload Posts</div>
</div>
</div>
<div className=" p-2 mx-8 right flex flex-col">
<form className='px-8' id='upload-form' onSubmit={handleSubmit}>
<div className=" p-2 mx-4 right flex flex-col">
{/* <label className='my-2 font-sans text-md font-semibold' htmlFor='token'>Paste your web3.storage API token here</label> */}
{/* <input className='text-black px-8 flex w-10/12' type='password' id='token' onChange={e => setToken(e.target.value)} required /> */}
<label className='my-2 font-sans text-md font-semibold' htmlFor='filepicker'>Pick files to store</label>
<input type='file' id='filepicker' name='fileList' onChange={e => setFiles(e.target.files)} multiple required />
<label className='my-2 font-sans text-md font-semibold'>Description</label>
<input className='text-pink-500 rounded-md px-8 flex w-10/12 outline outline-offset-2 outline-pink-300 outline-width:4px; ' type='text' placeholder='Hey,there !'/>


<div className='flex justify-center items-center my-4 mx-6'>
<div className='rounded-2xl bg-gray-200 outline outline-offset-2 outline-pink-300 outline-width:4px'>
<div className=' text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold text-black hover:text-pink-500'>
<input className="px-8 my-2 cursor-pointer" type='submit' value='Post' id='submit' />
</div>
</div>
</div>
</div>
</form>
</div>
</main>
</div>
<div id='output'>
        
  {messages.map((m, i) => <div key={m + i}>{m}</div>)}
   </div>
   {/* <Footer/> */}
   </>
  )
}