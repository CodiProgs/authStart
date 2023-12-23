"use client";

import { DeleteRefreshTokenMutation } from '@/gql/graphql';
import { DELETE_REFRESH_TOKEN } from '@/graphql/mutation/DeleteRefreshToken';
import { useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';

function DeleteSession({ sessionId, setDeletedSessionId }: { sessionId: number, setDeletedSessionId: React.Dispatch<React.SetStateAction<number[] | null>> }) {
  const [deleteSession, { data, loading, error }] = useMutation<DeleteRefreshTokenMutation>(DELETE_REFRESH_TOKEN, {
    variables: {
      id: sessionId
    }
  });
  const handleDeleteSession = async () => {
    await deleteSession();
  }

  useEffect(() => {
    if (!loading && data !== undefined) {
      if (Boolean(data?.deleteRefreshToken) === true) {
        window.location.reload();
      } else {
        setDeletedSessionId((prev) => [...(prev || []), sessionId]);
      }
    }
  }, [loading])

  return (
    <button className='text-[15px] font-bold text-red-500 border-[#3a3a3a] border px-4 py-1 rounded-lg hover:bg-[#3a3a3a]' onClick={handleDeleteSession}>Завершить</button>
  );
}

export default DeleteSession;