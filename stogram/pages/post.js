import React, { useState, useReducer } from 'react'
import { Web3Storage } from 'web3.storage'
import Navbar from '@/components/Navbar'

export default function Home () {
  const [messages, showMessage] = useReducer((msgs, m) => msgs.concat(m), [])
  const [token, setToken] = useState('')
  const [files, setFiles] = useState([])

  async function handleSubmit (event) {
    // don't reload the page!
    event.preventDefault()

    showMessage('Posting')
    const client = new Web3Storage({ token })

    showMessage('> 🤖 chunking and hashing the files (in your browser!) to calculate the Content ID')
    const cid = await client.put(files, {
      onRootCidReady: localCid => {
        showMessage(`> 🔑 locally calculated Content ID: ${localCid} `)
        showMessage('> 📡 sending files to web3.storage ')
      },
      onStoredChunk: bytes => showMessage(`> Posted ${bytes.toLocaleString()} `)
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
    <><Navbar /><main className='my-16 rounded-xl bg-slate-900 text-green-400'>
<div className='flex justify-center items-center my-6 mx-4'>
<div className='rounded-2xl bg-slate-900'>
<div className=' text-3xl my-4 mx-8 cursor-pointer font-mono font-semibold'>
Upload Posts</div>
</div>
</div>
<div className=" p-4 mx-8 right flex flex-col">
<form id='upload-form' onSubmit={handleSubmit}>
<div className=" p-2 mx-4 right flex flex-col">
<label htmlFor='token'>Paste your web3.storage API token here</label>
<input type='password' id='token' onChange={e => setToken(e.target.value)} required />
<label htmlFor='filepicker'>Pick files to store</label>
<input type='file' id='filepicker' name='fileList' onChange={e => setFiles(e.target.files)} multiple required />
<div className='flex justify-center items-center my-2 mx-6'>
<div className='rounded-2xl bg-slate-800'>
<div className=' text-2xl my-2 mx-3 cursor-pointer font-mono font-semibold hover:text-white'>
<input className="px-8 my-2 cursor-pointer" type='submit' value='Submit' id='submit' />
</div>
</div>
</div>
</div>
</form>
</div>
</main>

<div id='output'>
        
  {messages.map((m, i) => <div key={m + i}>{m}</div>)}
   </div>
   </>
  )
}