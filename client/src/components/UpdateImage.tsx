"use client";

import { UpdateImageMutation } from '@/gql/graphql';
import { UPDATE_IMAGE } from '@/graphql/mutation/UpdateImage';
import { useUserStore } from '@/stores/userStore';
import { URL_SERVER } from '@/utils/variables';
import { useMutation } from '@apollo/client';
import Image from 'next/image';
import React from 'react';
import { HiOutlinePhoto } from 'react-icons/hi2';

function UpdateImage () {
    const [updateImage, { loading, error, data }] = useMutation<UpdateImageMutation>(UPDATE_IMAGE)

    const setUser = useUserStore((state) => state.setUser);
    const user = useUserStore((state) => state);
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {        
            try {
                const response =await updateImage({
                    variables: {
                        id: user.id,
                        image: e.target.files[0]
                    }
                })
                response && response.data && setUser({
                    image: response.data.updateImage
                })
            }catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div>
            <label htmlFor="fileInput" className='relative group rounded-full'>
                <Image width={1920} height={1080} src={URL_SERVER + user.image!} alt="" className='w-[200px] h-[200px] object-cover rounded-full cursor-pointer group-hover:shadow-avatar transition-all duration-300 hover:duration-300'/>
                <div className='absolute rounded-full bg-avatar w-full h-full inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:duration-300 flex items-center justify-center flex-col cursor-pointer text-center'>
                    <HiOutlinePhoto size={32} color='white'/>
                    <p className='text-white'>Выбрать аватар для канала</p>
                </div>
            </label>
            <input type="file" className="hidden" id='fileInput' onChange={(e) => handleFileChange(e)}/>
        </div>
    );
}

export default UpdateImage;