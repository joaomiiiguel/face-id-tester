import React, { useEffect } from 'react'
import { SignOut } from "@phosphor-icons/react";
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '@/redux/userSlice';
import { useRouter } from 'next/router';

export default function Painel() {
  const dispatch = useDispatch()
  const userName = useSelector((state) => state.user.name)
  const router = useRouter()

  console.log(userName);

  useEffect(() => {
    if(userName === null){
      router.push('/')
    }
  },[])

  return (
    <div className='flex flex-col items-center w-screen h-screen'>

      <div className='flex flex-row justify-between items-center w-full p-8'>
        <p>Olá, {userName}</p>
        <button onClick={() => dispatch(logoutUser(), localStorage.clear(), router.push('/'))} className="flex">
          <SignOut size={20} />
          <p>Logout</p>
        </button>
      </div>
      <p>Page Private</p>
    </div>
  )
}
