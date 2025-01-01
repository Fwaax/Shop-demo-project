import React from 'react'
import { useJwtToken } from '../hooks/useJwtToken';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';


const BuyPage = () => {
    const { user, token, clearData, payload } = useJwtToken();
    const location = useLocation();
    const navigate = useNavigate();
    const shouldRefetch = location.state?.refetch ?? false;

    const { data: gatoShopMyItems = [], isLoading, isError, refetch } = useQuery({
        staleTime: 0,
        gcTime: 0,
        queryKey: ["gatoShopMyItems", payload, token],
        queryFn: async () => {
            if (!payload) {
                console.warn("Payload is undefined, returning empty array.");
                return [];
            }
            try {
                const response = await axios({
                    method: 'get',
                    url: `http://localhost:7821/shop/my-items`,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log(`response Buy-page`, response);
                const itemObjectList = response.data as {
                    _id: string;
                    itemId: {
                        _id: string;
                        name: string;
                        description: string;
                        imageUrl: string;
                    };
                    quantity: number;
                    pricePerItem: number;
                    ownerId: string;
                }[];
                return itemObjectList || []; // Ensure response is always defined
            } catch (error) {
                console.error("Error fetching my items:", error);
                return []; // Return empty array on error
            }
        },
        refetchOnMount: shouldRefetch,
    });


    // const { data: gatoShopAllItems = [], isLoading: isLoading2, isError: isError2, refetch: refetch2 } = useQuery({
    //     staleTime: 0,
    //     gcTime: 0,
    //     queryKey: ["gatoShopAllItems", payload, token],
    //     queryFn: async () => {
    //         if (!payload) {
    //             console.warn("Payload is undefined, returning empty array.");
    //             return [];
    //         }
    //         try {
    //             const response = await axios({
    //                 method: 'get',
    //                 url: `http://localhost:7821/shop/all-items`,
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             });
    //             console.log(`response Buy-page`, response);
    //             const itemObjectList = response.data as {
    //                 item: {
    //                     _id: string;
    //                     name: string;
    //                     description: string;
    //                     imageUrl: string;
    //                 },
    //                 quantity: number;
    //                 pricePerUnit: number;
    //                 userId: string;
    //             }[];
    //             return itemObjectList || []; // Ensure response is always defined
    //         } catch (error) {
    //             console.error("Error fetching my items:", error);
    //             return []; // Return empty array on error
    //         }
    //     },
    //     refetchOnMount: shouldRefetch,
    // });



    return (
        <div className="w-[100%] flex flex-col mt-[50px]">
            <div className="flex flex-col items-center">
                <div className="text-xl"><strong>My Items</strong></div>
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div>Error loading items. Please try again.</div>
                ) : gatoShopMyItems.length === 0 ? (
                    <div>No items found.</div>
                ) : (
                    <div className="flex flex-col items-center">
                        <table className="w-[70%] table-fixed border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300">Name</th>
                                    <th className="border border-gray-300">Description</th>
                                    <th className="border border-gray-300">Quantity</th>
                                    <th className="border border-gray-300">Image</th>
                                    <th className="border border-gray-300">Price per unit</th>
                                    <th className="border border-gray-300">Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gatoShopMyItems.map((itemInShop) => (
                                    <tr key={itemInShop._id}>
                                        <td className='border border-gray-300'>{itemInShop.itemId.name}</td>
                                        <td className='border border-gray-300'>{itemInShop.itemId.description}</td>
                                        <td className='border border-gray-300'>{itemInShop.quantity}</td>
                                        <td className='border border-gray-300'>
                                            <img src={itemInShop.itemId.imageUrl} alt={itemInShop.itemId.name} className="w-16 h-16" />
                                        </td>
                                        <td className='border border-gray-300'>{itemInShop.pricePerItem}</td>
                                        <td className='border border-gray-300'>{itemInShop.ownerId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



            {/* 
            <div className='flex flex-col items-center'>
                <div className='text-xl'><strong>All Items</strong></div>
                <div className='flex flex-col items-center'>
                    <table className='w-[70%] table-fixed border-collapse border border-gray-300'>
                        <thead>
                            <tr>
                                <th className='border border-gray-300'>Name</th>
                                <th className='border border-gray-300'>Description</th>
                                <th className='border border-gray-300'>Quantity</th>
                                <th className='border border-gray-300'>Image</th>
                                <th className='border border-gray-300'>Price per unit</th>
                                <th className='border border-gray-300'>Owner</th>
                            </tr>
                            {
                                gatoShopAllItems.map((itemInShop) => (
                                    <tr key={itemInShop.item._id}>
                                        <td className='border border-gray-300'>{itemInShop.item.name}</td>
                                        <td className='border border-gray-300'>{itemInShop.item.description}</td>
                                        <td className='border border-gray-300'>{itemInShop.quantity}</td>
                                        <td className='border border-gray-300'>{itemInShop.item.imageUrl}</td>
                                        <td className='border border-gray-300'>{itemInShop.pricePerUnit}</td>
                                        <td className='border border-gray-300'>{itemInShop.userId}</td>
                                    </tr>
                                ))
                            }
                        </thead>
                    </table>
                </div>
            </div> */}
        </div>
    )
}

export default BuyPage
