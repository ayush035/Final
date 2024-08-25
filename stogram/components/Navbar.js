import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import  '@/styles/Home.module.css'

export default function Navbar() {

    return (
        
            <>
                        {/* <div className=" h-6 my-4 px-8  text-black mx-16 rounded-lg font-mono font-semibold text-center" >
            We are live on Gitcoin Grants Round 21 ! Donate <Link href="https://shorturl.at/Q3P6O" legacyBehavior><a className="text-pink-500">here ↗️</a></Link>

            </div>
            <hr  /> */}

        
            <nav className=' flex justify-between h-12 text-pink-500 bg-white   font-bold' >
                <span className='mx-20 my-2 flex text-pink-500 text-2xl  '><Link href={"/"}>Stogram</Link></span>
                <ul className= 'px-2 py-3 flex space-x-10 mx-12 '>
                    

             <div>
        <input className='px-4 rounded-lg text-smfont-semibold font-mono h-8 outline outline-offset-2 outline-slate-300 outline-width:4px hover:outline-pink-500 outline-width: 4px' type="search" placeholder="Search..." />
        </div>
        <div className='hover:text-black delay-50  text-md font-semibold font-mono'>
        
            <Link href="/search">Naming service</Link></div>
        
        
            {/* <Link href="/search">Search</Link> */}

            <div className='hover:text-black delay-50  text-md font-semibold font-mono'>
        
            <Link href="/newpost">Post</Link></div>

        <div className='hover:text-black delay-50 text-md font-semibold font-mono '>
    
            <Link href="/profile">Profile</Link></div>

            <div className='hover:text-black delay-50  text-md font-semibold font-mono'>
        
            <Link href="/explore">Explore</Link></div>
              {/* <div className=' mx-2 my-2 '> */}            
        <ConnectButton/>
            </ul>
        </nav>
        
       
        </>
        
        );
        }