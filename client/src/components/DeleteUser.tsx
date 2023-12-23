"use client";

import { DeleteUserMutation } from '@/gql/graphql';
import { DELETE_USER } from '@/graphql/mutation/DeleteUser';
import { useUserStore } from '@/stores/userStore';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function DeleteUser() {
  const [open, setOpen] = React.useState(false);
  const [deleteUser, { data, loading, error }] = useMutation<DeleteUserMutation>(DELETE_USER);
  const logoutUser = useUserStore((state) => state.logout);

  const { push } = useRouter()

  const handleDeleteUser = async () => {
    await deleteUser();
    logoutUser();
    setOpen(false);
    push('/');
  }

  useEffect(() => {
    return () => {
      if (open) {
        setOpen(false);
      }
    }
  }, [])
  return (
    <div>
      <button className='text-[15px] font-bold text-red-500 border-[#3a3a3a] border px-4 py-1 rounded-lg hover:bg-[#3a3a3a]' onClick={() => setOpen(!open)}>Удалить аккаунт</button>
      {open && (
        <div className='fixed right-0 top-0 left-0 bottom-0 w-full h-full flex items-center justify-center z-50'>
          <div className='w-full h-full bg-[#000000] opacity-60 absolute' />
          <div className='bg-[#494949] w-max min-w-[400px] flex flex-col h-max px-8 py-4 rounded-lg relative'>
            <h4 className='text-[15px] mb-5 font-bold text-center'>Вы уверены что хотите удалить аккаунт?</h4>
            <div className='flex items-center justify-between'>
              <button className='text-[15px] font-bold text-red-500 border-[#3a3a3a] border px-4 py-1 rounded-lg hover:bg-[#3a3a3a]' onClick={handleDeleteUser}>Удалить</button>
              <button className='text-[15px] font-bold text-white border-[#3a3a3a] border px-4 py-1 rounded-lg hover:bg-[#3a3a3a]' onClick={() => setOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteUser;