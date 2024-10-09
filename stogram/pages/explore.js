import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import logo from '@/public/logo.jpg'
import Image from 'next/image'
import Link from "next/link";

export default function Home() {
    return (
<>
<Navbar/>
<div className="flex ">
  
<div className='flex my-24'>
  <div className='grid grid-cols-4 gap-2  '>
    
  <div className=' bg-black shadow-2xl text-white mx-20 my-2 rounded-xl outline outline-offset-2 outline-zinc-700 outline-width:4px  '>
                <div className="mx-1 my-1 cursor-pointer ">
                    <a href='https://bafybeietu4bacniu3vfiparmvxqmd4oclzdiieqva2gaz2exyif46ne4tu.ipfs.dweb.link/Logo.png'>
                    <Image src={logo} 
                    alt='' height="260px" width='400px'>
                    </Image></a>
                    </div>
                    <div className=' flex justify-center'>
                    <div className=' text-purple-300 font-sans my-2 hover:text-white'>
                       <Link href="/donate1">
                        Donate / Stake
                       </Link>
                    </div>
                    </div>
                    </div>

</div></div></div>
{/* <Footer/> */}
</>
    )
}