"use client";

import { GetUsersQuery } from '@/gql/graphql';
import { GET_USERS } from '@/graphql/queries/GetUsers';
import { URL_SERVER } from '@/utils/variables';
import { useQuery } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function GetUsers() {
    const { loading, error, data } = useQuery<GetUsersQuery>(GET_USERS);

    return (
        <>
            <h1>Все пользователи</h1>
            {
                !loading ? (
                    data?.getUsers?.map((user) => (
                        <div key={user.id} className="flex items-center gap-4">
                            <Image
                                src={URL_SERVER + user.avatar!}
                                alt=""
                                width={1920}
                                height={1080}
                                className="rounded-full w-[100px] h-[100px] object-cover"
                            />
                            <Link href={'/user/' + user.username}>
                                <p>{user.name} {user.surname}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>Loading...</div>
                )
            }
        </>
    );
}

export default GetUsers;