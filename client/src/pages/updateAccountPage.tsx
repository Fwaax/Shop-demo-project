import axios from "axios";
import React, { useState } from "react";
import { useJwtToken } from "../hooks/useJwtToken";
import { useNavigate } from "react-router-dom";
import { PASSWORD_REGEX } from "./registerPage";

export const BACKEND_URL = 'http://localhost:7821';
const AccountEdit: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useJwtToken();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match.");
            return;
        }
        if (!newPassword || newPassword.length < 8) {
            setMessage("New password must be at least 8 characters long.");
            return;
        }
        if (!PASSWORD_REGEX.test(newPassword)) {
            setMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }
        setIsLoading(true);
        try {
            if (!token) {
                setMessage("Authentication token not found. Please log in again.");
                return;
            }
            const response = await axios.put(
                `${BACKEND_URL}/user/update`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/"), 2000); // Redirect after 2 seconds
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to change password.";
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-[#1d1e2a] p-4">
            <div className="w-full max-w-md bg-[#14151f] shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold text-center mb-4">Change Password</h2>
                {message && (
                    <p
                        className={`text-center mb-4 ${message.includes("success")
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                    >
                        {message}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="current-password"
                            className="block text-sm font-medium text-[#bfbfba]"
                        >
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="new-password"
                            className="block text-sm font-medium text-[#bfbfba]"
                        >
                            New Password
                        </label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-[#bfbfba]"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isLoading && "opacity-50 cursor-not-allowed"
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Change Password"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AccountEdit;