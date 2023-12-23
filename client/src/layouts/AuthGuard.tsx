"use client"

import { useUserStore } from '@/stores/userStore';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const [show, setShow] = React.useState(false);
    const user = useUserStore((state) => state);
    const [hover, setHover] = React.useState(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
    const userLogout = useUserStore((state) => state.logout);

    useEffect(() => {
        const listenStorageChange = () => {
            setShow(true)
            if (user.id !== undefined) {
                userLogout();
            }
        };
        if (show) {
            if (timeoutId === null) {
                setTimeoutId(setTimeout(() => {
                    setShow(false);
                }, 4000))
            }

            if (hover) {
                clearTimeout(timeoutId!)
            } else if (timeoutId !== null) {
                setTimeoutId(setTimeout(() => {
                    setShow(false);
                }, 2000))
            }
        }

        window.addEventListener("Unauthorized", listenStorageChange);
        return () => window.removeEventListener("Unauthorized", listenStorageChange);
    }, [user.id, setHover, hover, show, setShow]);
    return (
        <>
            {children}
            {show && (
                <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className='fixed bg-[#333333] top-[30px] left-0 right-0 mx-auto max-w-[300px] w-full px-[30px] py-[20px] h-max min-h-[100px] border border-blueColor z-50 flex items-center flex-col gap-4 rounded-lg'>
                    <button className='group absolute right-5 top-5 p-1' onClick={() => setShow(!show)}>
                        <IoCloseOutline size={20} className="stroke-[#999999] group-hover:stroke-blueColor" />
                    </button>
                    <p>Вы не авторизованы</p>
                    <Link href={'/auth/login'} className={['rounded-md h-[34px] bg-colorBackground text-[15px] px-[19px] w-max flex items-center hover:shadow-[0_0_0_2px_#0332FF] font-bold', ''].join(' ')} onClick={() => setShow(!show)}>
                        Войти
                    </Link>
                </div>
            )}
        </>
    );
}

export default AuthGuard;