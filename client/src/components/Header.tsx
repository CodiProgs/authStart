"use client";

import { useUserStore } from '@/stores/userStore';
import { URL_SERVER } from '@/utils/variables';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import Logout from './Logout';

function Header() {
  const user = useUserStore((state) => state);
  const [mounted, setMounted] = React.useState(false);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (open && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', clickOutside);
    return () => {
      document.removeEventListener('click', clickOutside);
    }
  }, [open])
  return (
    <header className='w-full h-full mx-auto max-w-7xl flex items-center justify-between'>
      <Link href={'/'} className='text-[15px] font-bold'>Главная</Link>
      <>
        {mounted ? (
          user.id ? (
            <div className='relative h-full'>
              <button className='flex items-center gap-2 px-1 h-full' onClick={() => setOpen(!open)}>
                <Image src={URL_SERVER + user.avatar!} alt="avatar" width={1920} height={1080} className='rounded-full w-[36px] h-[36px] object-cover' />
                <IoIosArrowDown size={12} />
              </button>
              {open && (
                <div className='absolute top-full right-0 bg-[#494949] w-[200px] rounded-lg py-3' ref={modalRef}>
                  <ul>
                    <li>
                      <Link href={`/user/${user.username}`} className='flex items-center gap-2 text-[15px] w-full px-4 hover:bg-[#3a3a3a] py-2' onClick={() => setOpen(false)}>
                        <FaRegUser size={16} /> Профиль
                      </Link>
                    </li>
                    <li>
                      <Link href={'/settings'} className='flex items-center gap-2 text-[15px] w-full px-4 hover:bg-[#3a3a3a] py-2' onClick={() => setOpen(false)}>
                        <IoSettingsOutline size={16} /> Настройки
                      </Link>
                    </li>
                    <li>
                      <Logout onClick={() => setOpen(false)} />
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Link href={'/auth/login'} className='text-[15px]'>Войти</Link>
          )
        ) : (
          <button>
            <div className='bg-[#494949] w-[36px] h-[36px] rounded-full animate-pulse' />
          </button>
        )}
      </>
    </header>
  );
}

export default Header;