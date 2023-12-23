"use client";

import { useUserStore } from '@/stores/userStore';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import UpdateImage from './UpdateImage';
import { useQuery } from '@apollo/client';
import { GetUserProfileQuery } from '@/gql/graphql';
import { GET_USER_PROFILE } from '@/graphql/queries/GetUserProfile';
import Image from 'next/image';
import { URL_SERVER } from '@/utils/variables';

function GetUserById() {
  const username = useParams().username;
  const user = useUserStore((state) => state);

  const [mounted, setMounted] = React.useState(false);
  const { data, loading, error } = useQuery<GetUserProfileQuery>(GET_USER_PROFILE, { variables: { username } });

  useEffect(() => {
    if (!loading) {
      setMounted(true)
    }
  }, [loading])

  if (mounted) {
    return (
      <div className='flex items-center gap-[30px]'>
        {user.id === data?.getUserProfile?.id ? (
          <UpdateImage />
        ) : (
          <Image width={1920} height={1080} src={URL_SERVER + data?.getUserProfile?.avatar!} alt="" className='w-[200px] h-[200px] object-cover rounded-full cursor-pointer' />
        )}
        <div>
          <h1>{data?.getUserProfile?.name} {data?.getUserProfile?.surname}</h1>
          <p>{data?.getUserProfile?.email}</p>
        </div>
      </div>
    );
  }
}

export default GetUserById;