"use client"

import Header from '@/components/Header';
import { client } from '@/utils/apolloClient';
import { ApolloProvider } from '@apollo/client';
import React from 'react';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <>
                <div className='fixed top-0 w-full z-40 h-[48px]'>
                    <Header />
                </div>
                <div className='w-full pt-[48px]'>
                    <div className='max-w-7xl mx-auto'>
                        {children}
                    </div>
                </div>
            </>
        </ApolloProvider>
    );
}

export default Layout;