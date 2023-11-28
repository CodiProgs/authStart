"use client";

import { useUserStore } from '@/stores/userStore';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import UpdateImage from './UpdateImage';

function GetUserById () {
    const fullname = useParams().fullname;
    const user = useUserStore((state) => state);
    
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true)
    }, [])

    if(mounted){
        return (
            <div className='absolute top-0 h-full w-[90%] mx-auto right-0 left-0 flex items-center gap-[30px]'>
                User {user.fullname}
                {user.fullname?.toLowerCase().replace(/\s+/g, '') === fullname ? (
                    <UpdateImage/>
                ) : (
                    <p>Not photo</p>
                )} 
            </div>
        );
    }
}

export default GetUserById;