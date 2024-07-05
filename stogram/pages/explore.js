import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import logo from '@/public/logo.jpg'
import Image from 'next/image'

export default function Home() {
    return (
<>
<Navbar/>
<div className="flex ">
  
<div className='flex my-16'>
  <div className='grid grid-cols-4 gap-2 '>
    
  <div className=' bg-white shadow-2xl text-white mx-20 my-2 rounded-xl outline outline-offset-2 outline-pink-300 outline-width:4px '>
                <div className="mx-1 my-1 cursor-pointer ">
                    <a href='https://bafybeietu4bacniu3vfiparmvxqmd4oclzdiieqva2gaz2exyif46ne4tu.ipfs.dweb.link/Logo.png'>
                    <Image src={logo} 
                    alt='' height="260px" width='400px'>
                    </Image></a>
                    </div>
                    <div className=' flex justify-center'>
                    <div className=' text-pink-500 font-mono my-2'>
                       <button>
                        Donate
                       </button>
                    </div>
                    </div>
                    </div>

</div></div></div>
{/* <Footer/> */}
</>
    )
}