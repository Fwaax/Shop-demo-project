import React from 'react'
import { useJwtToken } from '../hooks/useJwtToken';
import axios from 'axios';
import { IPopulatedTransferHistory } from '../interfaces';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const MyItemsPage = () => {
    const { user, token, clearData, payload } = useJwtToken();
    const location = useLocation();
    const navigate = useNavigate();

    const shouldRefetch = location.state?.refetch ?? false;

    const { data: myItems = [], isLoading, isError, refetch } = useQuery({
        staleTime: 0,
        gcTime: 0,
        queryKey: ["myItems", payload, token],
        queryFn: async () => {
            if (!payload) {
                console.warn("Payload is undefined, returning empty array.");
                return [];
            }
            try {
                const response = await axios({
                    method: 'get',
                    url: `http://localhost:7821/item/${payload.id}`,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return response.data || []; // Ensure response is always defined
            } catch (error) {
                console.error("Error fetching my items:", error);
                return []; // Return empty array on error
            }
        },
        refetchOnMount: shouldRefetch,
    });


    function handleAddItem() {
        navigate("/post-item");
    }

    async function handlePostItem(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        try {
            if (!payload) {
                return null;
            }
            const theID = payload.id
            const response = await axios({
                method: 'post',
                url: `http://localhost:7821/item/post-to-shop`,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.log(`error my items page post handle`, error);
        }
    }

    if (!token) {
        return <div>You are not logged in</div>
    }

    return (
        <div className='w-[100%] flex flex-col mt-[50px]'>
            <div className='flex flex-col items-center'>
                <div className='text-xl'><strong>All transfers</strong></div>
                <div className='flex flex-col items-center'>
                    <div className='w-[70%] flex justify-end' onClick={handleAddItem}>
                        <button className="px-4 py-2 text-white bg-[#a1a1a1] rounded-lg hover:bg-[#556b82] focus:outline-none focus:ring-2 focus:ring-[#556b82] mb-4">Add Item</button>
                    </div>
                    <table className='w-[70%] table-fixed border-collapse border border-gray-300'>
                        <thead>
                            <tr>
                                <th className='border border-gray-300'>Name</th>
                                <th className='border border-gray-300'>Quantity</th>
                                <th className='border border-gray-300'>Price</th>
                                <th className='border border-gray-300'>Description</th>
                                <th className='border border-gray-300'>ImageUrl</th>
                                <th className='border border-gray-300'>Post to shop</th>
                            </tr>
                            {
                                myItems.map((item: IPopulatedTransferHistory) => (
                                    <tr key={item._id}>
                                        <td className='border border-gray-300'>{item.itemId.name}</td>
                                        <td className='border border-gray-300'>{item.quantity}</td>
                                        <td className='border border-gray-300'>{item.totalCost}</td>
                                        <td className='border border-gray-300'>{item.itemId.description}</td>
                                        <td className='border border-gray-300'>{item.itemId.imageUrl}</td>
                                        <td className='border border-gray-300'><button className='px-4 py-2 text-white bg-[#a1a1a1] rounded-lg hover:bg-[#556b82] focus:outline-none focus:ring-2 focus:ring-[#556b82]'>Post</button></td>
                                    </tr>
                                ))
                            }
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MyItemsPage


// Check token
// Get user items
// Show items
// Add item
// Delete item
// Update item