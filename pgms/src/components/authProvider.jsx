import { createContext, useState } from "react";

export const AuthContext = createContext(); // Exporting AuthContext here

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [emailInitial, setEmailInitial] = useState("");

    const login = (email) => {
        setIsLoggedIn(true);
        setEmailInitial(email.toLowerCase());
    };

    const logout = () => {
        setIsLoggedIn(false);
        setEmailInitial("");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, emailInitial }}>
            {children}
        </AuthContext.Provider>
    );
};
