import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=(?:.*[A-Z]){3})(?=(?:.*[a-z]){3})(?=(?:.*\d){1})(?=(?:.*[!@#$%^&*]){1}).*$/;

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const navigate = useNavigate();

    async function submitHandler(event: React.FormEvent<HTMLButtonElement>) {
        event.preventDefault()
        if (!emailValid || !passwordValid) {
            setError("Please correct the errors before submitting.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://localhost:7821/register", {
                email,
                password,
                firstName,
                lastName
            });
            alert(response.data);
            setLoading(false);
            navigate("/");
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data || "Signup failed");
        }
        console.log(email, password, firstName, lastName);
    };



    const validateEmail = (email: string) => {
        setEmail(email);
        setEmailValid(EMAIL_REGEX.test(email));
    };

    const validatePassword = (password: string) => {
        setPassword(password);
        setPasswordValid(PASSWORD_REGEX.test(password));
    };

    return (
        <div className="w-[100vw] h-[100vh] mx-auto p-6 bg-gray-100 rounded-lg shadow-md flex flex-col justify-center items-center">
            <form action="" className="flex flex-col space-y-6 w-[20em]">
                <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556b82]"
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#556b82]"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => validateEmail(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border ${emailValid ? "border-gray-300" : "border-red-500"} rounded-md shadow-sm focus:outline-none focus:ring-[#556b82] focus:border-[#556b82] sm:text-sm`}
                            required
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            onChange={(e) => validatePassword(e.target.value)}
                            className={`mt-1 block w-full px-3 py-2 border ${passwordValid ? "border-gray-300" : "border-red-500"} rounded-md shadow-sm focus:outline-none focus:ring-[#556b82] focus:border-[#556b82] sm:text-sm`}
                            required
                        />
                    </div>
                </div>
            </form>
            <div className='mt-4'>
                <button
                    type="submit"
                    className="w-full p-2 bg-[#838282] text-white rounded-md hover:bg-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-[#556b82]"
                    onClick={submitHandler}>
                    Register
                </button>
            </div>
        </div>
    )
}

export default RegisterPage
