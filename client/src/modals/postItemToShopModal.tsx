import React from 'react'
import { cn } from '../utils/classNames';
import { NumericInputWithNumberValue } from '../components/numberInput';
import axios from 'axios';
import { useJwtToken } from '../hooks/useJwtToken';

const PostItemToShopModal = (props: { itemId: string, hide: () => void }) => {
    const [insertedPriceValue, setInsertedPriceValue] = React.useState(0);
    const [insertedQuantityValue, setInsertedQuantityValue] = React.useState(0);
    const { token } = useJwtToken();

    async function handlePostItem() {
        console.log(`insertedPriceValue`, insertedPriceValue);
        try {
            const response = await axios({
                method: 'post',
                url: `http://localhost:7821/item/item`,  // Fix later not currect url for the posting the item to shop
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { price: insertedPriceValue, quantity: insertedQuantityValue, itemId: props.itemId },
            });
            console.log(`response`, response);
            return response.data || []; // Ensure response is always defined
        } catch (error) {
            console.error("Error fetching my items:", error);
            return []; // Return empty array on error
        }
        props.hide();
    }

    return (
        <div className="flex flex-col gap-0 bg-[#111111] max-w-full w-[440px] rounded-[16px] border-2 border-solid border-white/6">
            <TopSection hide={props.hide} />
            <FieldsSection insertedPriceValue={insertedPriceValue} setInsertedPriceValue={setInsertedPriceValue} insertedQuantityValue={insertedQuantityValue} setInsertedQuantityValue={setInsertedQuantityValue} />
            <BottomSection hide={props.hide} onPostBTNClick={handlePostItem} />

        </div>
    )
}

function TopSection({ hide }: { hide: () => void }) {
    return (
        <div className="flex flex-row justify-between items-center px-4 py-4 border-b border-solid border-white/6">
            <p className="font-vt323 text-[20px] text-white [word-spacing:6px]">Edit Item</p>
            <span
                className="flex px-2 rounded-md py-1 border border-solid border-white/10 bg-[#070707] text-white/50 font-vt323 text-md tracking-widest hover:bg-white/10 cursor-pointer"
                onClick={hide}
            >
                Esc
            </span>
        </div>
    );
}

function BottomSection(props: {
    hide: () => void;
    onPostBTNClick: () => void;
}) {
    return (
        <div className="flex flex-row justify-end gap-4 items-center px-6 py-4 border-t-2 border-solid border-white/6 font-arcade-classic bg-white/2">
            <div>
                { }
            </div>
            <button
                className={cn(
                    "text-base w-24 justify-center leading-none rounded-[4px] px-6 py-2 text-white/40 bg-white/4 hover:text-white/90 hover:bg-white/10 transition-colors",
                )}
                onClick={() => props.hide()}
            >
                Cancel
            </button>
            <button
                className={cn(
                    "font-arcade-classic leading-none border-2 border-solid border-[#00CC6A] rounded-[4px] text-[#00CC6A] hover:border-[#00CC6A]/70 hover:text-[#00CC6A]/70 transition-colors flex justify-center items-center px-6 py-2",
                )}
                onClick={props.onPostBTNClick}
            >
                Post
            </button>
        </div>
    );
}

function FieldsSection(props: { insertedPriceValue: number, setInsertedPriceValue: (value: number) => void, insertedQuantityValue: number, setInsertedQuantityValue: (value: number) => void }) {
    return (
        <div className="flex size-full w-[430px] flex-col gap-10 p-5">
            <div className="flex flex-col gap-4 p-2">
                <p className="font-vt323 text-base text-white/50">Price</p>
                <NumericInputWithNumberValue
                    className="w-full text-lg text-black font-vt323 bg-white/2 border border-solid border-white/3 rounded-[8px] placeholder-white placeholder-opacity-20 px-2 py-3"
                    value={props.insertedPriceValue}
                    setValue={props.setInsertedPriceValue}
                    placeholder="Enter Name"
                />
                <p className="font-vt323 text-base text-white/50 mt-6">Quantity</p>
                <NumericInputWithNumberValue
                    className="w-full text-lg text-black font-vt323 bg-white/2 border border-solid border-white/3 rounded-[8px] px-2 py-3 placeholder-white placeholder-opacity-20"
                    value={props.insertedQuantityValue}
                    setValue={props.setInsertedQuantityValue}
                    placeholder="Enter Bio"
                />
            </div>
        </div>
    );
}

export default PostItemToShopModal
