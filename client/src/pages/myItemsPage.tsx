import React from 'react'
import { useJwtToken } from '../hooks/useJwtToken';
import axios from 'axios';
import { IPopulatedTransferHistory } from '../interfaces';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useModal from '../hooks/useModal';
import PostItemToShopModal from '../modals/postItemToShopModal';

const MyItemsPage = () => {
    const { user, token, clearData, payload } = useJwtToken();
    const location = useLocation();
    const navigate = useNavigate();
    const { show, hide } = useModal();

    const shouldRefetch = location.state?.refetch ?? false;

    const { data: myInventory = [], isLoading, isError, refetch } = useQuery({
        staleTime: 0,
        gcTime: 0,
        queryKey: ["myInventory", payload, token],
        queryFn: async () => {
            if (!payload) {
                console.warn("Payload is undefined, returning empty array.");
                return [];
            }
            try {
                const response = await axios({
                    method: 'get',
                    url: `http://localhost:7821/item/my-items`,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const itemObjectList = response.data as {
                    item: {
                        _id: string;
                        name: string;
                        description: string;
                        imageUrl: string;
                    },
                    quantity: number
                }[];

                return itemObjectList || []; // Ensure response is always defined
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

    async function handlePostItem(itemId: string) {
        show(<PostItemToShopModal itemId={itemId} hide={hide} />, {
            unstyled: true,
            showClose: false,
        });
    }

    if (!token) {
        return <div>You are not logged in</div>
    }

    return (
        <div className='w-[100%] flex flex-col mt-[50px]'>
            <div className='flex flex-col items-center'>
                <div className='text-xl'><strong>My items</strong></div>
                <div className='flex flex-col items-center'>
                    <div className='w-[70%] flex justify-end' onClick={handleAddItem}>
                        <button className="px-4 py-2 text-white bg-[#a1a1a1] rounded-lg hover:bg-[#556b82] focus:outline-none focus:ring-2 focus:ring-[#556b82] mb-4">Add Item</button>
                    </div>
                    <table className='w-[70%] table-fixed border-collapse border border-gray-300'>
                        <thead>
                            <tr>
                                <th className='border border-gray-300'>Name</th>
                                <th className='border border-gray-300'>Description</th>
                                <th className='border border-gray-300'>Quantity</th>
                                <th className='border border-gray-300'>Post to shop</th>
                            </tr>
                            {
                                myInventory.map((inv) => (
                                    <tr key={inv.item._id}>
                                        <td className='border border-gray-300'>{inv.item.name}</td>
                                        <td className='border border-gray-300'>{inv.item.description}</td>
                                        <td className='border border-gray-300'>{inv.quantity}</td>
                                        <td className='border border-gray-300'><button className='px-4 py-2 text-white bg-[#a1a1a1] rounded-lg hover:bg-[#556b82] focus:outline-none focus:ring-2 focus:ring-[#556b82]' onClick={() => handlePostItem(inv.item._id)}>Post</button></td>
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