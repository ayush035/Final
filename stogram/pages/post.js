import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Username from "@/components/Username"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import PostUpload from '@/components/PostUpload';
export default function Home() {
    return (
     <>
  <Navbar/>
   <div className='flex justify-center my-4 '>
<div>
      <PostUpload/>
    </div></div></>
    )
  }