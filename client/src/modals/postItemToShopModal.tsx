import React from 'react'

const PostItemToShopModal = (props: { itemId: string, hide: () => void }) => {



    return (
        <div className="flex flex-col gap-0 bg-[#111111] max-w-full w-[440px] min-h-[300px] rounded-[16px] border-2 border-solid border-white/6">
            <TopSection hide={props.hide} />
        </div>
    )
}

function TopSection({ hide }: { hide: () => void }) {
    return (
        <div className="flex flex-row justify-between items-center px-4 py-4 border-b border-solid border-white/6">
            <p className="font-vt323 text-[20px] text-white [word-spacing:6px]">Edit Profile</p>
            <span
                className="flex px-2 rounded-md py-1 border border-solid border-white/10 bg-[#070707] text-white/50 font-vt323 text-md tracking-widest hover:bg-white/10 cursor-pointer"
                onClick={hide}
            >
                Esc
            </span>
        </div>
    );
}

export default PostItemToShopModal
