"use client"

import { ShowSessionQuery } from '@/gql/graphql';
import { SHOW_SESSION } from '@/graphql/queries/ShowSession';
import { useUserStore } from '@/stores/userStore';
import { useQuery } from '@apollo/client';
import { getCookie } from 'cookies-next';
import cookie from 'js-cookie'
import Link from 'next/link';
import { NextResponse } from 'next/server';
import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

function AuthGuard ({ children }: { children: React.ReactNode }) {
    const [show, setShow] = React.useState(false);
    const user = useUserStore((state) => state);
    const {loading, error, data} = useQuery<ShowSessionQuery>(SHOW_SESSION, {
        fetchPolicy: 'no-cache',
        variables: {
            userId: user.id
        }
    });
    
    useEffect(() => {
        
        const listenStorageChange = () => {
            if(user.id === undefined) {
                setShow(true)
            }
        };
        window.addEventListener("Unauthorized", listenStorageChange);
        return () => window.removeEventListener("Unauthorized", listenStorageChange);
    }, [])
    return (
        <>
            {children}
            {show && (
                <div className='fixed top-[30px] left-0 right-0 mx-auto max-w-[300px] w-full px-[30px] py-[20px] h-max min-h-[100px] border border-blueColor z-50 flex items-center flex-col gap-4 rounded-lg'>
                    <button className='group absolute right-5 top-5 p-1' onClick={() => setShow(!show)}>
                        <IoCloseOutline size={20} className="stroke-[#999999] group-hover:stroke-blueColor" />
                    </button>
                    <p>Вы не авторизованы</p>
                    <Link href={'/auth/login'} className={['rounded-md h-[34px] bg-colorBackground text-[15px] px-[19px] w-max flex items-center hover:shadow-[0_0_0_2px_#0332FF] font-bold', ''].join(' ')}>
                        Войти
                    </Link>
                </div>
            )}
        </>
    );
}

export default AuthGuard;