import React, { useState } from 'react'
import { useJwtToken } from '../hooks/useJwtToken';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IFEUser } from '../interfaces';

const GenerateMoney = () => {

    const { token, payload } = useJwtToken();

    const {
        data: user = null,
        refetch: refetchUser,
    } = useQuery({
        staleTime: Number.MAX_SAFE_INTEGER,
        gcTime: Number.MAX_SAFE_INTEGER,
        queryKey: [
            token,
            'fetchUserState',
            payload,
        ],
        queryFn: async () => {
            if (!payload) {
                return null;
            }
            const response = await axios.get(`http://localhost:7821/user/${payload.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data as IFEUser
        },
    });

    async function sendBackendRequestToGetMoney() {
        try {
            const response = await axios.post(`http://localhost:7821/generate/money`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            refetchUser();
        } catch (error) {
            console.error(`Error generating money`, error);
        }
    }


    if (!token) {
        return (
            <div>
                <p>You must be logged in to generate money</p>
            </div>
        )
    }

    return (
        <div>
            <p>{user?.email}</p>
            <p>Your Balance: {user?.balance || 0}$</p>
            <button onClick={sendBackendRequestToGetMoney}>Get Money!</button>
        </div>
    )
}

export default GenerateMoney
