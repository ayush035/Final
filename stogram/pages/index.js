import Image from 'next/image'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
// import Upload from '@/components/Upload'
// const inter = Inter({ subsets: ['latin'] })
import aset from "@/public/aset.webp"
import aset2 from "@/public/aset2.jpg"
import aset3 from "@/public/aset3.jpg"
import aset4 from "@/public/aset4.jpg"



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
  <div className="brightness-100 justify-right saturate-150">
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
<div className="flex justify-center my-10 text-5xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-purple-400">
   Let's Monetize Everyone!
   </div>

<div className='flex'>
<div className='grid grid-cols-3 gap-4  mx-20 my-14'>


<div className='rounded-2xl px-8 py-8  bg-zinc-900 cursor-pointer hover:bg-zinc-800 '>
  <div className='text-white font-sans font-semibold text-4xl'>
Post. 
</div>
<div className='text-zinc-400 font-sans font-semibolc text-lg my-2'>
Mint your posts as NFTs and have their ownership with yourself forever.
</div>
</div>

<div className='rounded-2xl px-8 py-8  bg-zinc-900 cursor-pointer hover:bg-zinc-800'>
  <div className='text-white font-sans font-semibold text-4xl'>
Donate, 
</div>
<div className='text-zinc-400 font-sans font-semibolc text-lg my-2'>
Support your favourite creator's work by monetizing them, with your donations!
</div>
</div>

<div className='rounded-2xl px-8 py-8  bg-zinc-900 cursor-pointer hover:bg-zinc-800'>
  <div className='text-white font-sans font-semibold text-4xl'>
Stake! 
</div>
<div className='text-zinc-400 font-sans  text-lg my-2'>
  Stake tokens on content creators and earn interest on it while getting access to the their premium content!
</div>
</div>

</div>
</div>

<div className="mx-20 my-16 text-5xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-purple-400">
How to get started?
   </div>
<div className='flex justify-center'>
   <div className='grid grid-cols-2 gap-6'>

    <div className='mx-28 my-4 brightness--80'>
    <Image 
src={aset2}
alt=''
width="380"
height="380"/>
 </div>

<div className='my-16'>
<div className='text-4xl font-sans font-bold text-white my-6 mx-12'>
Let's get you Onboard!
</div>
<div className='text-lg font-sans  text-zinc-300 my-4 mx-12'>Head over to the username from menu, type in the username of your choice
  click on check availability to check wether it's available or not, If yes, click on mint and approve the transaction. 
  Wooh! You're now onboard.🎉
</div>
</div>

<div className='my-16'>
<div className='text-4xl font-sans font-bold text-white my-6 mx-16'>
What to do now?
</div>
<div className='text-lg font-sans  text-zinc-300 my-4 mx-16'>
  Now that you are onboarded, you can now post anything you want on the platform 
  and Mint it as NFT, claiming its ownership onchain forever! 
  Just head over to post and select the pic you want to post and click Mint,
  Approve the transaction. Congrats! you have minted your first NFT. 🚀
</div>
</div>

<div className='mx-28 my-4 brightness--80'>
    <Image 
src={aset3}
alt=''
width="380"
height="380"/>
 </div>


 <div className='mx-28 my-4 brightness--80'>
    <Image 
src={aset4}
alt=''
width="400"
height="400"/>
 </div>


 <div className='my-16'>
<div className='text-4xl font-sans font-bold text-white my-6 mx-16'>
What's next?
</div>
<div className='text-lg font-sans  text-zinc-300 my-4 mx-16'>
  You can now headover to the explore page and view content posted by others
  on Stogram, and if you like someone's post too much you can also donate them
  to show your appreciation and support!🎗️ 
  <div className=' font-sans font-semibold text-white'> We are also cooking a new feature of staking which will monetize everyone on the platform. Coming Soon!🔒</div>
</div>
</div>


   </div>
   </div>
{/* <div className='text-black my-8'>
  .
</div> */}
   </>
  )
}

