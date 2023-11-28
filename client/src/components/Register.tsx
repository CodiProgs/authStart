"use client";

import { RegisterMutation } from '@/gql/graphql';
import { REGISTER } from '@/graphql/mutation/Register';
import { useUserStore } from '@/stores/userStore';
import { useMutation } from '@apollo/client';
import { GraphQLErrorExtensions } from 'graphql';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function Register () {
    const [register, {data, loading, error}] = useMutation<RegisterMutation>(REGISTER);
    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({});
    const { push } = useRouter()
    const [registerData, setRegisterData] = React.useState({ 
        fullname: '',
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
            const response = await register({
                variables: {
                    fullname: registerData.fullname,
                    password: registerData.password,
                    email: registerData.email,
                }
            }).catch(error => {
                if(error)
                {
                    setErrors(error.graphQLErrors[0].extensions)
                }
            })
            response && response.data && setUser({
                id: response.data.register.id,
                fullname: response.data.register.fullname,
                email: response.data.register.email,
                image: response.data.register.image
            })
    }

    return (
        <div>
            <h1>Register</h1>
            <div className='m-4 flex flex-col max-w-lg gap-6'>
                <input type="text" placeholder='Fullname' onChange={(e) => setRegisterData({...registerData, fullname: e.target.value})} className='px-5 py-3 border'/>
                {errors?.fullname! && <p className='text-red-500'>{errors.fullname as string}</p>}
                <input type="email" placeholder='Email' onChange={(e) => setRegisterData({...registerData, email: e.target.value})} className='px-5 py-3 border'/>
                {errors?.email! && <p className='text-red-500'>{errors.email as string}</p>}
                <input type="password" placeholder='Password' onChange={(e) => setRegisterData({...registerData, password: e.target.value})} className='px-5 py-3 border'/>
                {errors?.password! && <p className='text-red-500'>{errors.password as string}</p>}
                <button onClick={handleAuth} className='px-5 py-3 border w-max hover:bg-gray-300'>Register</button>
            </div>
        </div>
    );
}

export default Register;