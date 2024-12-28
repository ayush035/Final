import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import  '@/styles/Home.module.css'
import stolog from '@/public/stolog.jpg'
import Image from "next/image";
export default function Navbar() {

    return (
        
            <>
                        
          
            <nav className=' flex justify-between h-12 text-white   font-semibold  fixed top-0 left-0 w-full z-50 backdrop-blur-md my-2 ' >
                <span className='mx-24  flex text-purple-400 text-2xl  '>
                    
                    <Link href={"/"}>
                    <Image
                    src = {stolog}
                    alt=''
                 width="160"
                 height="160"/>
                        
                        
                      </Link></span>
                <ul className= 'px-2 py-3 flex space-x-10 mx-24 '>
                    

             <div>
        {/* <input className='px-4 rounded-lg text-smfont-semibold font-sans h-8 outline outline-offset-2 outline-slate-300 outline-width:4px hover:outline-purple-400 outline-width: 4px' type="search" placeholder="Search..." /> */}
        </div>
        <div className='hover:text-purple-300 delay-50  text-md  font-sans'>
        
            <Link href="/naming">Username</Link></div>
        
        
            {/* <Link href="/search">Search</Link> */}

            <div className='hover:text-purple-300 delay-50  text-md  font-sans'>
        
            <Link href="/minting">Post</Link></div>

        <div className='hover:text-purple-300 delay-50 text-md  font-sans '>
    
            <Link href="/explore">Explore</Link></div>

            <div className='hover:text-purple-300 delay-50  text-md  font-sans'>
        
            <Link href="/profile">Profile</Link></div>
            <div className="-my-2">
        <ConnectButton/></div>
            </ul>
        </nav>
        
       
        </>
        
        );
        }