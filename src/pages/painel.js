import React, { Suspense, useEffect } from 'react'
import { SignOut } from "@phosphor-icons/react";
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Painel() {
  const userName = useSelector((state) => state.user.name)
  const router = useRouter()

  useEffect(() => {
    if (userName === null) {
      router.push('/')
    }
  }, [])

  return (
    <div className='flex flex-col items-center w-screen h-screen bg-[#202020] text-white'>
      <div className='flex flex-row justify-between items-center w-full p-8'>
        <button onClick={() => {router.push('/login'), localStorage.clear()}} className="flex items-center">
          <SignOut size={20} />
          <p>Déconnecter</p>
        </button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='flex flex-col items-center'>
          <Image src={`https://raw.githubusercontent.com/joaomiiiguel/face-id-tester/main/public/images/${userName}.jpeg`} alt="" priority width={150} height={100} className='rounded-full mb-4 border-[#B48D41] border-2' />
          <p>Bonjour, <span className='capitalize font-bold'>{userName}</span></p>
        </div>
        <p>Page pour les utilisateurs identifiés</p>
      </Suspense>
    </div>
  )
}
