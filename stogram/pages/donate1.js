import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import logo from '@/public/logo.jpg'
import Image from 'next/image'

import Donate from '@/components/Donate'
export default function Fund() {
    return(
<>
<Navbar/>
<div className="mx-20 my-10 ">
<div className='grid grid-cols-2 gap-2 '>

<Image src={logo} 
                    alt='' height="600px" width='600px'>
                    </Image>
                    <div>
<div className= "mx-10 font-sans text-white text-xl font-bold">
    Owned By : 0xC72fa67241b2Ab95776DB23Cb27A845d4290d75B / ayush
</div>
<div className= "mx-10 my-4 font-sans text-white text-xl">
    Description : Its an authentic NFT of the Official Logo of this project.
</div>
<div className= "mx-10 font-sans text-white text-xl font-bold">
Donate
</div>
<div>
<input className='mx-10 font-sans pb-2 text-white text-xl bg-gray-200 rounded-lg my-4' placeholder='  $USDC ' type='number' />
</div>
<button className ="mx-10 font-sans text-white text-xl font-bold bg-pink-400 rounded-lg my-2 px-2 py-1">
 Donate 
   </button>
   {/* <Donate/> */}
   <div className= "mx-10 font-sans text-white text-xl font-bold">
Stake on NFT to earn rewards
</div>
<div>
<input className='mx-10 font-sans pb-2 text-white text-xl bg-gray-200 rounded-lg my-4' placeholder=' Coming soon!'  />
</div>
<button className ="mx-10 font-sans text-white text-xl font-bold bg-pink-400 rounded-lg my-2 px-2 py-1">
 Stake
   </button>

</div>

    </div>
</div>
</>
    )
}