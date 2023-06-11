import ReconhecimentoFacial from '@/components/ReconhecimentoFacial'
import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

import LogoIFS from '../../public/logoIFS.png'
import Image1 from '../../public/imageLogin1.png'
import Image2 from '../../public/imageLogin2.png'

export default function Home() {
  return (
    <main
      className={`flex h-screen flex-col items-center justify-center overflow-hidden bg-[#202020] p-24 ${inter.className} `}
      >
      <Image src={Image1} alt="" className='fixed h-screen w-auto left-0 mix-blend-lighten blur-[3px]' />
      <Image src={Image2} alt="" className='fixed h-screen w-auto right-0 mix-blend-lighten blur-[3px]' />

      <div className='flex max-w-lg flex-col items-center shadow-lg bg-black justify-between rounded-xl overflow-hidden px-20 py-14 relative text-center'>
        <Image src={LogoIFS} alt="Logo of IFS" />
        <div className='my-6'>
          <p className='text-xl font-bold uppercase'>Cette page est protégée</p>
          <p className='text-xs uppercase'>Connectez-vous par reconnaissance faciale</p>
        </div>
        <div className='rounded-lg overflow-hidden mb-6'>
          <ReconhecimentoFacial />
        </div>
        <div className='flex flex-col justify-between'>
          <button className='w-full p-2 px-8 opacity-90 rounded bg-gradient-to-b from-[#B48D41] to-[#755A27] hover:opacity-100'>Scanne mon visage</button>
          <p className='text-sm mt-4'>Entrer le mot de passe</p>
        </div>
      </div>

    </main>
  )
}
