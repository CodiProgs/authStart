"use client";

import { SetUsernameMutation, ValidateUsernameQuery } from '@/gql/graphql';
import { SET_USERNAME } from '@/graphql/mutation/SetUsername';
import { VALIDATE_USERNAME } from '@/graphql/queries/ValidateUsername';
import { useUserStore } from '@/stores/userStore';
import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { IoMdClose } from "react-icons/io";

function SetUsername() {
  const user = useUserStore((state) => state);
  const setUser = useUserStore((state) => state.setUser);
  const [open, setOpen] = React.useState(false);

  const [username, setUsername] = React.useState(user.username);
  const [setUsernameMutation, { data: setUsernameData }] = useMutation<SetUsernameMutation>(SET_USERNAME, { variables: { username: username } });
  const { data, error } = useQuery<ValidateUsernameQuery>(VALIDATE_USERNAME, { variables: { username } });

  const handleSetUsername = async () => {
    await setUsernameMutation();
    setUser({ ...user, username: setUsernameData?.setUsername.username! });
    setOpen(false);
  }

  useEffect(() => {
    return () => {
      if (open) {
        setOpen(false);
      }
    }
  }, [])
  return (
    <>
      <button className='text-[15px] font-bold border-[#3a3a3a] border px-4 py-1 rounded-lg hover:bg-[#3a3a3a]' onClick={() => setOpen(!open)}>Изменить</button>
      {open && (
        <div className='fixed right-0 top-0 left-0 bottom-0 w-full h-full flex items-center justify-center z-50'>
          <div className='w-full h-full bg-[#000000] opacity-60 absolute' />
          <div className='bg-[#494949] w-full min-h-[200px] max-w-[600px] flex flex-col justify-center h-max px-8 rounded-lg relative'>
            <button className='absolute top-3 right-4 group p-1' onClick={() => setOpen(false)}>
              <IoMdClose size={24} className='text-white opacity-80 group-hover:opacity-100' />
            </button>
            <h4 className='text-[15px] mb-3 font-bold'>Изменить адрес страницы</h4>
            <div>
              <div className='flex items-center my-4'>
                <div className='text-[15px] text-white'>{window.location.origin}/user/</div>
                <input type="text" className='border border-[#3a3a3a] pr-4 py-2 rounded-lg outline-none text-white bg-[#3a3a3a]' placeholder={user.username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className='flex items-center gap-6'>
                <button className={['text-[15px] font-bold text-white border-[#3a3a3a] border px-4 py-1 rounded-lg', !data?.validateUsername ? 'bg-[#3a3a3a]' : 'hover:bg-[#3a3a3a]'].join(' ')} disabled={!data?.validateUsername} onClick={handleSetUsername}>Сохранить</button>

                {username !== user.username && username !== '' && (
                  !error ? (
                    data?.validateUsername ? (
                      <span className='text-[15px] text-green-500'>Свободен</span>
                    ) : (
                      <span className='text-[15px] text-red-500'>Этот адрес уже используется</span>
                    )
                  ) : (
                    <span>{error.message}</span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SetUsername;