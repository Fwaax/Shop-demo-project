import React from 'react';
import { useJwtToken } from '../hooks/useJwtToken';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PriceCheck = () => {
    const { token, payload } = useJwtToken();
    const location = useLocation();
    const shouldRefetch = location.state?.refetch ?? false;
    const { itemId } = location.state || {};

    const { data: priceCheck = [], isLoading, isError } = useQuery({
        staleTime: 0,
        gcTime: 0,
        queryKey: ["priceCheck", payload, token],
        queryFn: async () => {
            if (!payload) {
                console.warn("Payload is undefined, returning empty array.");
                return [];
            }
            try {
                const response = await axios({
                    method: 'get',
                    url: `http://localhost:7821/item/my-items/${itemId}`,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return response.data || [];
            } catch (error) {
                console.error("Error fetching my items:", error);
                return [];
            }
        },
        refetchOnMount: shouldRefetch,
    });

    async function handlePostItem(event: React.MouseEvent<HTMLButtonElement>, itemId: string, price: number) {
        event.preventDefault();
        try {
            if (!payload) {
                return null;
            }
            const response = await axios({
                method: 'post',
                url: `http://localhost:7821/item/post-to-shop`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { itemId, price },
            });
            return response.data;
        } catch (error) {
            console.log(`Error posting item:`, error);
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error loading items.</div>;
    }

    return (
        <div className='w-[100%] flex flex-col mt-[50px]'>
            <div className='flex flex-col items-center'>
                <div className='text-xl'><strong>Price Check</strong></div>
                <table className='w-[70%] table-fixed border-collapse border border-gray-300'>
                    <thead>
                        <tr>
                            <th className='border border-gray-300'>Name</th>
                            <th className='border border-gray-300'>Description</th>
                            <th className='border border-gray-300'>Quantity</th>
                            <th className='border border-gray-300'>Price</th>
                            <th className='border border-gray-300'>Post to shop</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(priceCheck) && priceCheck.map((inv) => (
                            <tr key={inv.item._id}>
                                <td className='border border-gray-300'>{inv.item.name}</td>
                                <td className='border border-gray-300'>{inv.item.description}</td>
                                <td className='border border-gray-300'>{inv.quantity}</td>
                                <td className='border border-gray-300'>
                                    <label htmlFor={`price-${inv.item._id}`}>Price per unit: </label>
                                    <input type="number" id={`price-${inv.item._id}`} />
                                </td>
                                <td className='border border-gray-300'>
                                    <button
                                        className='px-4 py-2 text-white bg-[#a1a1a1] rounded-lg hover:bg-[#556b82] focus:outline-none focus:ring-2 focus:ring-[#556b82]'
                                        onClick={(event) => handlePostItem(event, inv.item._id, Number((document.getElementById(`price-${inv.item._id}`) as HTMLInputElement).value))}
                                    >
                                        Post
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PriceCheck;
