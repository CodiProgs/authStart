"use client";

import { GetUsersQuery } from '@/gql/graphql';
import { GET_USERS } from '@/graphql/queries/GetUsers';
import { URL_SERVER } from '@/utils/variables';
import { useQuery } from '@apollo/client';
import Image from 'next/image';
import React from 'react';

function GetUsers () {
    const {loading, error, data} = useQuery<GetUsersQuery>(GET_USERS);

    return (
        <>
            {!loading ? data?.getUsers.map((user) => (
                <div key={user.id}>
                    <p>{user.email}</p>
                    <Image src={URL_SERVER + user.image} alt='' width={1920} height={1080} className='w-[100px] h-[100px] rounded-full object-cover'/>
                </div>
            )): <p>Loading...</p>}
        </>
    );
}

export default GetUsers;