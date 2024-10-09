import Link from "next/link";

export default function Upload() {

    return (
<div className='flex justify-center items-center '>

<main className='my-16 rounded-xl bg-slate-900 text-green-400'>
<div className='flex justify-center items-center my-6 mx-4'>
<div className='rounded-2xl bg-slate-900'>
<div className=' text-3xl my-4 mx-8 cursor-pointer font-sans font-semibold'>
Upload Posts</div>
</div>
</div>
<div className=" p-4 mx-8 right flex flex-col">
      <form id='upload-form'>
        {/* <label htmlFor='token'>Paste your web3.storage API token here</label>
        <input type='password' id='token'  /> */}
        {/* <label htmlFor='filepicker' className='px-8'>
          Pick Files you want to upload
          </label> */}
<div className=" p-2 mx-4 right flex flex-col">

        <input className="px-2 h-12 my-2 " type='file' id='filepicker' name='fileList' />

        <div className='flex justify-center items-center my-2 mx-6'>
        <div className='rounded-2xl bg-slate-800'>
        <div className=' text-2xl my-2 mx-3 cursor-pointer font-sans font-semibold hover:text-white'>
        <input className="px-8 my-2 cursor-pointer" type='submit' value='Post' id='submit' />
        </div>
            </div>
            </div>
        </div>
      </form>
      </div>
</main>
</div>
    )
}