import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
    email: string;
    firstName: string;
}

interface TokenPayload extends User {
    "id": string,
    "iat": number,
    "exp": number
}

interface LoginResponse {
    token: string;
    user: User;
}

export const useJwtToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [payload, setPayload] = useState<TokenPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const decodeToken = (token: string): TokenPayload | null => {
        try {
            const decoded: TokenPayload = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp > currentTime ? decoded : null;
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            const decodedPayload = decodeToken(storedToken);

            if (decodedPayload) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setPayload(decodedPayload);
            } else {
                clearData();
            }
        }
        setLoading(false);
    }, []);
    const saveData = (loginData: LoginResponse) => {

        localStorage.setItem("token", loginData.token);
        localStorage.setItem("user", JSON.stringify(loginData.user));

        const decodedPayload = decodeToken(loginData.token);
        if (decodedPayload) {
            setToken(loginData.token);
            setUser(loginData.user);
            setPayload(decodedPayload);
        } else {
            console.error("Received an expired or invalid token.");
            clearData();
        }
    };
    const clearData = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setPayload(null);
    };

    return {
        token,
        user,
        payload,
        loading,
        saveData,
        clearData,
        decodeToken
    };
};