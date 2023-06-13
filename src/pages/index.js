import { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { logginUser } from '@/redux/userSlice';
import { useRouter } from 'next/router';
import Painel from './painel';

const Guard = ({ user }) => {
  const router = useRouter();
  const dispatch = useDispatch()


  useEffect(() => {
    if (localStorage.getItem('userFaceISF')) {
      const nameStorage = localStorage.getItem('userFaceISF')
      dispatch(logginUser(nameStorage))
    }

    if (user === null) {
      router.push('/login')
    }
  }, [user])

  console.log(user);

  return (
    <Painel/>
  )
}

export default function Home() {
  const userName = useSelector((state) => state.user.name)

  return (
    <Guard user={userName} />
  )
}