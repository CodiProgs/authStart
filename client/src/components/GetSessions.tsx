"use client";

import { GetRefreshTokensQuery } from '@/gql/graphql';
import { GET_REFRESH_TOKENS } from '@/graphql/queries/GetRefreshTokens';
import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import DeleteSession from './DeleteSession';

function GetSessions() {
  const { data, loading, error } = useQuery<GetRefreshTokensQuery>(GET_REFRESH_TOKENS);

  const [deletedSessionId, setDeletedSessionId] = useState<number[] | null>(null);
  return (
    <div>
      <h2 className='text-xl mb-6 font-bold'>Ваша активность</h2>
      {!loading ? (
        data?.getRefreshTokens.filter((session) => !deletedSessionId?.includes(session.id)).map((session) => (
          <div key={session.id} className='py-2 border border-gray-300 rounded px-4 flex justify-between items-center'>
            <div>
              <p>IP: {session.ip}</p>
              <p>Устройство: {session.device}</p>
              <p>Создан {new Date(session.createdAt).toLocaleDateString()} в {new Date(session.createdAt).toLocaleTimeString()}</p>
            </div>
            <DeleteSession sessionId={session.id} setDeletedSessionId={setDeletedSessionId} />
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default GetSessions;