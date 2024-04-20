import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
    return (
<>
<Navbar/>
<div className="flex justify-center items-center h-screen">
    <div className="text-3xl my-8 mx-auto text-gray-400 font-mono font-semibold">
        Unfortunately! Nothing to see here. 🥹💔
    </div>
</div>
{/* <Footer/> */}
</>
    )
}