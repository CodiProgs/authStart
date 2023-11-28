"use client";

import { LoginMutation } from '@/gql/graphql';
import { LOGIN } from '@/graphql/mutation/Login';
import { useUserStore } from '@/stores/userStore';
import { useMutation } from '@apollo/client';
import { GraphQLErrorExtensions } from 'graphql';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function Login () {
    const [login, {data, loading, error}] = useMutation<LoginMutation>(LOGIN);
    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({});
    const [invalidCredentials, setInvalidCredentials] = React.useState("");
    const { push } = useRouter()
    const [loginData, setLoginData] = React.useState({ 
        email: '', 
        password: '',
    });

    const user = useUserStore((state) => state);
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        if(user.id !== undefined) {
            push(`/user/${user.fullname!.toLowerCase().replace(/\s+/g, '')}`);
        }
    })

    const handleAuth = async () => {
        setErrors({})
            const response = await login({
                variables: {
                    password: loginData.password,
                    email: loginData.email,
                }
            }).catch(error => {
                if(error && error.graphQLErrors[0].extensions?.invalidCredentials)
                {
                    setInvalidCredentials(error.graphQLErrors[0].extensions?.invalidCredentials as string)
                }else{
                    setErrors(error.graphQLErrors[0].extensions)
                }
            })
            response && response.data && setUser({
                id: response.data.login.id,
                fullname: response.data.login.fullname,
                email: response.data.login.email,
                image: response.data.login.image
            })
    }

    return (
        <div>
            <h1>Login</h1>
            <div className='m-4 flex flex-col max-w-lg gap-6'>
                <input type="email" placeholder='Email' onChange={(e) => setLoginData({...loginData, email: e.target.value})} className='px-5 py-3 border'/>
                {errors?.email! && <p className='text-red-500'>{errors.email as string}</p>}
                <input type="password" placeholder='Password' onChange={(e) => setLoginData({...loginData, password: e.target.value})} className='px-5 py-3 border'/>
                {errors?.password! && <p className='text-red-500'>{errors.password as string}</p>}
                {invalidCredentials && <p className='text-red-500 text-sm'>{invalidCredentials}</p>}
                <button onClick={handleAuth} className='px-5 py-3 border w-max hover:bg-gray-300'>Login</button>
            </div>
        </div>
    );
}

export default Login;