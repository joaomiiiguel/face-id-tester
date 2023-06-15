import React, { useEffect } from 'react'
import { SignOut } from "@phosphor-icons/react";
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '@/redux/userSlice';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Painel() {
  const dispatch = useDispatch()
  const userName = useSelector((state) => state.user.name)
  const router = useRouter()

  console.log(userName);

  useEffect(() => {
    if (userName === null) {
      router.push('/')
    }
  }, [])

  return (
    <div className='flex flex-col items-center w-screen h-screen'>

      <div className='flex flex-row justify-between items-center w-full p-8'>
        <button onClick={() => dispatch(logoutUser(), localStorage.clear(), router.push('/'))} className="flex items-center">
          <SignOut size={20} />
          <p>Déconnecter</p>
        </button>
      </div>
      <div className='flex flex-col items-center'>
        <Image src={`https://raw.githubusercontent.com/joaomiiiguel/face-id-tester/main/public/images/${userName}.jpeg`} alt="" priority width={150} height={100}/>
        <p>Bonjour, <span className='capitalize font-bold'>{userName}</span></p>
      </div>
      <p>Page pour les utilisateurs identifiés</p>
    </div>
  )
}
