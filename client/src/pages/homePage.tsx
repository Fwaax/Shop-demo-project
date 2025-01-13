import React, { useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import CatSvg from '../components/svg/catSvg'
import { useJwtToken } from '../hooks/useJwtToken';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { IFEItem, IPopulatedTransferHistory, ITransferHistory } from '../interfaces';


const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const shouldRefetch = location.state?.refetch ?? false;
    const { user, token, clearData } = useJwtToken();


    const { data: transactionHistory = [], isLoading, isError, refetch } = useQuery({
        staleTime: 0,
        gcTime: 0,
        queryKey: ["transactionHistory"],
        queryFn: async () => {
            try {
                const response = await axios({
                    method: 'get',
                    url: 'http://localhost:7821/history/transaction-history',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log(`response`, response);
                return response.data
            } catch (error) {
                console.log(`error`, error);
            }
        },
        refetchOnMount: shouldRefetch
    })

    return (
        <div className='w-[100%] flex flex-col mt-[50px]'>
            <div className='flex flex-col items-center'>
                <div className='text-xl'><strong>All transfers</strong></div>
                <div className='flex flex-col items-center'>
                    <table className='w-[70%] table-fixed border-collapse border border-gray-300'>
                        <thead>
                            <tr>
                                <th className='border border-gray-300'>Transaction Hash</th>
                                <th className='border border-gray-300'>Name</th>
                                <th className='border border-gray-300'>Quantity</th>
                                <th className='border border-gray-300'>Price</th>
                                <th className='border border-gray-300'>Date</th>
                                <th className='border border-gray-300'>Description</th>
                                <th className='border border-gray-300'>ImageUrl</th>
                            </tr>
                            {
                                transactionHistory.map((item: IPopulatedTransferHistory) => (
                                    <tr key={item._id}>
                                        <td className='border border-gray-300 overflow-hidden'>{item._id}</td>
                                        <td className='border border-gray-300'>{item.itemId.name}</td>
                                        <td className='border border-gray-300'>{item.quantity}</td>
                                        <td className='border border-gray-300'>{item.totalCost}</td>
                                        <td className="border border-gray-300">
                                            {new Date(item.dateInUnix * 1000).toISOString().split("T")[0]}
                                        </td>

                                        <td className='border border-gray-300'>{item.itemId.description}</td>
                                        <td className='border border-gray-300'>{item.itemId.imageUrl}</td>
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

export default HomePage
