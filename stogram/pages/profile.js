import React, { useState, useReducer } from 'react'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import { Web3Storage } from 'web3.storage'
import stogram from '../public/stogram.jpg'
import pic from '../public/pic.jpg'
import Footer from '../components/Footer'





export default function profile()   
{
    const [messages, showMessage] = useReducer((msgs, m) => msgs.concat(m), [])
  const [token, setToken] = useState('')
    const Web_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDUxODdDYTU3ZWU1MEEwOWZmOUI2NDAzMDRiQTlDNEZBOTE3MjlDM0YiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODQ3NzU2NjQ4MjYsIm5hbWUiOiJBeXVzaCJ9.rR03Th49YPmOVoy8n8teXTTImO1P5wz4BxAFDFAb3wM'
    const client = new Web3Storage({ token: Web_STORAGE_TOKEN })

    return (
     <>
  <Navbar/>

  <div className=' flex justify-center'>
    <div className=' text-3xl font-mono font-semibold text-pink-500 my-6'>
        Your Posts
    </div>
  </div>

  <div className='flex'>
  <div className='grid grid-cols-4 gap-2 '>
    
  <div className=' bg-white shadow-2xl text-white mx-20 my-2 rounded-xl outline outline-offset-2 outline-pink-300 outline-width:4px '>
                <div className="mx-1 my-1 cursor-pointer ">
                    <a href='https://bafybeietu4bacniu3vfiparmvxqmd4oclzdiieqva2gaz2exyif46ne4tu.ipfs.dweb.link/Logo.png'>
                    <Image src={stogram} 
                    alt='' height="260px" width='400px'>
                    </Image></a>
                    </div>
                    <div className=' flex justify-center'>
                    <div className=' text-pink-500 font-mono my-2'>
                        <a href='https://bafybeietu4bacniu3vfiparmvxqmd4oclzdiieqva2gaz2exyif46ne4tu.ipfs.dweb.link'>
                        View on IPFS
                        </a>
                    </div>
                    </div>
                    </div>

                    {/* <div className=' bg-white shadow-2xl text-white mx-20 my-2 rounded-xl outline outline-offset-2 outline-pink-300 outline-width:4px '>
                <div className="mx-1 my-1 cursor-pointer">
                <a href='https://bafybeiab2w2lb6dugorkaxoi3fsl7666bh2m2erxpk7ahvgi5voxvxcvtu.ipfs.dweb.link/photo_2023-04-28_20-29-12.jpg'>
                    <Image src={pic} 
                    alt='' height="260px" width='400px'>
                    </Image></a>
                    </div>
                    <div className=' flex justify-center'>
                    <div className=' text-pink-500 font-mono my-2'>
                        <a href='https://bafybeiab2w2lb6dugorkaxoi3fsl7666bh2m2erxpk7ahvgi5voxvxcvtu.ipfs.dweb.link'>
                        View on IPFS
                        </a>
                    </div>
                    </div>
                    </div> */}


    </div>
  </div>
  {/* <Footer/> */}
  </>
    )
}