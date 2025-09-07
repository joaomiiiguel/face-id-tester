import React, { useState } from 'react'
import Image from 'next/image'
import { SpinnerGap } from "@phosphor-icons/react";
import { useSelector, useDispatch } from 'react-redux'
import { logginUser } from '@/redux/userSlice';

import ReconhecimentoFacial from '@/components/ReconhecimentoFacial'

import LogoIFS from '../../public/logoIFS.png'
import Image1 from '../../public/imageLogin1.png'
import Image2 from '../../public/imageLogin2.png'
import { useRouter } from 'next/router';

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('nenhum_rosto_detectado')
    const router = useRouter()
    const dispatch = useDispatch()


    function handleLogin() {
        if(name === 'nenhum_rosto_detectado'){
            alert('Utilisateur non identifié!')
            return
        }
        setLoading(true)
        setTimeout(() => {
            if (name === '' || name === null) {
                setLoading(false)
                return
            }
            dispatch(logginUser(name))
            localStorage.setItem('userFaceISF', name);
            router.push('/painel')
            setLoading(false)
        }, 1500);
        console.log('logado');
    }

    return (
        <main
            className={`flex h-screen flex-col items-center justify-center bg-[#202020]`}
        >
            <Image src={Image1} alt="" className='fixed h-screen w-auto left-0 mix-blend-lighten blur-[3px]' />
            <Image src={Image2} alt="" className='fixed h-screen w-auto right-0 mix-blend-lighten blur-[3px]' />

            <div className='flex h-[85vh] max-h-[600px] max-w-lg flex-col items-center shadow-lg bg-black justify-between rounded-xl overflow-hidden px-20 py-10 relative text-center'>
                <Image src={LogoIFS} alt="Logo of IFS" className='h-[10vh] w-auto' />
                <div className='my-6'>
                    <p className='text-xl font-bold uppercase'>Cette page est protégée</p>
                    <p className='text-xs uppercase'>Connectez-vous par reconnaissance faciale</p>
                </div>
                <div className='rounded-lg overflow-hidden'>
                    <ReconhecimentoFacial setUserRecon={setName}/>
                </div>
                <div className='flex flex-col justify-between w-full mt-6'>
                    {loading ?
                        <button disabled className='w-full flex justify-center p-2 px-8 opacity-70 rounded bg-gradient-to-b from-[#B48D41] to-[#755A27]'>
                            <SpinnerGap size={26} className="animate-spin" />
                        </button>
                        :
                        <button onClick={() => handleLogin()} className='w-full p-2 px-8 opacity-90 rounded bg-gradient-to-b from-[#B48D41] to-[#755A27] hover:opacity-100'>Scanne mon visage</button>
                    }
                    <p className='text-sm mt-4'>Entrer le mot de passe</p>
                </div>
            </div>

        </main>
    )
}
