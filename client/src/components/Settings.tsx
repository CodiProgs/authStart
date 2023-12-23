"use client";

import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import SetUsername from './SetUsername';
import DeleteUser from './DeleteUser';
import { useRouter } from 'next/navigation';
import GetSessions from './GetSessions';

function Settings() {
  const user = useUserStore((state) => state);
  const [location, setLocation] = React.useState<String>();
  const { push } = useRouter()

  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocation(window.location.origin);
    }
  }, []);
  useEffect(() => {
    if (user.id === undefined) {
      push('/auth/login')
    } else {
      setMounted(true);
    }
  }, [user.id])
  if (mounted) {
    return (
      <div className='max-w-xl w-full flex flex-col gap-4'>
        <div>
          Ваш ID: {user.id}
        </div>
        <div className='flex items-center justify-between'>
          <div className='text-[15px]'>Ваш адрес страницы: {location}/user/{user.username}</div>
          <SetUsername />
        </div>
        <DeleteUser />
        <GetSessions />
      </div>
    );
  }
}

export default Settings;