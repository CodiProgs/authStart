"use client"

import { client } from '@/utils/apolloClient';
import { ApolloProvider } from '@apollo/client';
import React from 'react';

function Layout ({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}

export default Layout;