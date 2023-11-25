"use client";

import { useUserStore } from '@/stores/userStore';
import React, { useEffect } from 'react';

function Unauthorized ({error} : {error: string}) {
    const logout = useUserStore((state) => state.logout);
    const [show, setShow] = React.useState(true);
    useEffect(() => {
        if(error) {
            logout();
            setTimeout(() => {
                setShow(false)
            }, 3000)
        }
    }, [error])

    if(show && error) {
        return (
            <div className='absolute h-max top-[30px] w-max bg-blue-400 left-0 right-0 mx-auto min-w-[300px] py-4'>
                <p className='text-white text-center'>Вы не авторизованы</p>
            </div>
        );
    }
}

export default Unauthorized;