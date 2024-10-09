import Image from 'next/image'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
// import Upload from '@/components/Upload'
// const inter = Inter({ subsets: ['latin'] })
import d from '../public/d.jpg'
import e from '../public/e.jpg'
import shield from '../public/shield.png'
import Footer from '@/components/Footer'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import aset from "@/public/aset.webp"
export default function Home() {
  return (
   <>

 
<Navbar/>
<div className="my-16 text-black">.

</div>
<div className= "flex justify-center text-6xl font-sans font-bold my-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-400">
Decentralized SocialFi Platform.</div>
<div className= "flex justify-center text-xl text-purple-200 font-sans  ">
Empowering users with privacy, ownership, and seamless monetization 
</div><div className= "flex justify-center text-xl text-purple-200 font-sans">
through blockchain technology.
</div>
<div className="my-16 mx-48">
<div className=" flex justify-center rounded-xl px-6 py-32 outline outline-offset-1 outline-pink-300 outline-width:2px">
  <div className=" grid grid-cols-2 ">
  <div className="brightness-100 justify-right saturate-150

">
<Image 
src={aset}
alt=''
width="400"
height="400"/></div>
<div className="mx-20 my-6"> 

<div className= "flex justify-right text-8xl text-white font-sans font-bold ">
    Post.

  </div>
  <div className= "flex justify-right text-8xl text-white font-sans font-bold py-2">
    Stake,

  </div>
  <div className= "flex justify-right text-8xl text-purple-300 font-sans font-bold">
    Earn!
  </div>
  </div></div>
{/* <div className = "text-2xl font-sans font-bold text-white "> */}
{/* Experience the Future of Social Media with Stogram. Our decentralized platform empowers users to control their digital identities, engage through staking, and support creators directly. Join us in redefining social interactions in the blockchain era!</div> */}
</div></div>
{/* <div className ='flex justify-center items-center my-20 mx-20'>

<Image 
src={e}
alt=''
width="1100"
height="400"/>

</div> */}
<div className="my-36"></div>


   </>
  )
}

