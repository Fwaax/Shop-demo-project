import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJwtToken } from '../hooks/useJwtToken';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { BACKEND_URL } from './updateAccountPage';

const PostItemPage = () => {
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemImage, setItemImage] = useState('');
    const [itemQuantity, setItemQuantity] = useState('');
    const { token, payload } = useJwtToken();
    const navigate = useNavigate();

    async function handlePostItem(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        try {
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await axios({
                method: 'post',
                url: `${BACKEND_URL}/item/new-item`,
                data: { itemName, itemDescription, itemImage, itemQuantity },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            console.log(`response`, response);
            navigate('/', { state: { refetch: true } });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log(`Failed to post item axios error`, error.response.data);
            } else {
                console.log(`Failed to post item`, error);
            }
        }
    }

    return (
        <div>
            <div>
                <h4>Post Item</h4>
            </div>
            <div>
                <label htmlFor="itemName">Item Name</label>
                <input
                    type="text"
                    name="itemName"
                    placeholder="Item Name"
                    onChange={(e) => setItemName(e.target.value)}
                />

                <label htmlFor="itemDescription">Item Description</label>
                <input
                    type="text"
                    placeholder="Item Description"
                    onChange={(e) => setItemDescription(e.target.value)}
                />

                <label htmlFor="itemImage">Item Image</label>
                <input
                    type="text"
                    placeholder="Item Image"
                    onChange={(e) => setItemImage(e.target.value)}
                />

                <label htmlFor="itemQuantity">Item Quantity</label>
                <input
                    type="text"
                    placeholder="Item Quantity"
                    onChange={(e) => setItemQuantity(e.target.value)}
                />

                <button onClick={handlePostItem}>Post</button>
            </div>
        </div>
    );
};

export default PostItemPage;
