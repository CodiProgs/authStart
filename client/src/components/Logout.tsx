"use client";

import { LogoutMutation } from '@/gql/graphql';
import { LOGOUT } from '@/graphql/mutation/Logout';
import { useUserStore } from '@/stores/userStore';
import { useMutation } from '@apollo/client';
import React from 'react';
import { FiLogOut } from "react-icons/fi";

function Logout({ onClick }: { onClick: () => void }) {

  const [logout, { data, loading, error }] = useMutation<LogoutMutation>(LOGOUT);
  const logoutUser = useUserStore((state) => state.logout);
  const handleLogout = async () => {
    await logout();
    logoutUser();
    onClick();
  }
  return (
    <button className='flex items-center gap-2 text-[15px] w-full px-4 hover:bg-[#3a3a3a] py-2' onClick={handleLogout}>
      <FiLogOut size={16} /> Выйти
    </button>
  );
}

export default Logout;