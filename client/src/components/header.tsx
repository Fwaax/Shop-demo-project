import React from 'react';
import CatSvg from './svg/catSvg';
import { useNavigate } from 'react-router-dom';
import { useJwtToken } from '../hooks/useJwtToken';

const Header = () => {
    const navigate = useNavigate();
    const { user, token, clearData } = useJwtToken();


    function regNavHandler() {
        navigate("/register");
    }

    function logNavHandler() {
        navigate("/login");
    }

    function logoutHandler() {
        localStorage.removeItem('token');
        navigate("/login");
    }

    function accountNavHandler() {
        navigate("/update-account");
    }

    function myItemsHandler() {
        navigate("/my-items");
    }

    const tokenExists = token ? true : false;

    return (
        <div className="flex justify-center w-full bg-gray-600">
            <div className="flex h-[50px] w-[70%]">
                <div className="flex flex-row justify-between w-full items-center">
                    <div className="flex flex-row items-center gap-1">
                        <div>
                            <CatSvg />
                        </div>
                        <h4 className="text-white font-bold text-lg">El Gato</h4>
                    </div>
                    <div>
                        <nav>
                            <ul className="flex gap-8 text-white font-medium">
                                <li className="cursor-pointer hover:text-green-400 transition-colors">Buy</li>
                                <li className="cursor-pointer hover:text-green-400 transition-colors">Sell</li>
                                <li className="cursor-pointer hover:text-green-400 transition-colors">History</li>
                                <li className="cursor-pointer hover:text-green-400 transition-colors">Balance</li>
                                {tokenExists ? (
                                    <>
                                        <li onClick={myItemsHandler}
                                            className="cursor-pointer hover:text-red-400 transition-colors">
                                            My shop
                                        </li>
                                        <li
                                            onClick={accountNavHandler}
                                            className="cursor-pointer hover:text-red-400 transition-colors"
                                        >
                                            Update Account
                                        </li>
                                        <li
                                            onClick={logoutHandler}
                                            className="cursor-pointer hover:text-red-400 transition-colors"
                                        >
                                            Logout
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li
                                            onClick={logNavHandler}
                                            className="cursor-pointer hover:text-blue-400 transition-colors"
                                        >
                                            Login
                                        </li>
                                        <li
                                            onClick={regNavHandler}
                                            className="cursor-pointer hover:text-blue-400 transition-colors"
                                        >
                                            Register
                                        </li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Header;
