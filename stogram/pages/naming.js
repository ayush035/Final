import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UsernameRegistry from '@/components/UsernameRegistry'
import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function Home() {
    return (
     <>
  <Navbar/>
   <div className='flex justify-center my-4 '>
<div>
      <UsernameRegistry />
    </div></div></>
    )
  }