import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase/firebase';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from "uuid";
const useAddTenentCreds = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addTenentCreds = async (tenantEmail) => {
        if (!tenantEmail) {
            setError('No tenant email provided');
            return false;
        }

        setLoading(true);
        try {
            // Check if the tenant email already exists in the tenantCreds collection
            const tenantCredsQuery = query(collection(db, 'tenantCreds'), where('email', '==', tenantEmail));
            const tenantCredsSnapshot = await getDocs(tenantCredsQuery);
            if (!tenantCredsSnapshot.empty) {
                setLoading(false);
                return { email: tenantEmail, password: 'Already exists' }; // Return message if email already exists
            }
            const generateToken = () => {
                return uuidv4();
            };
            // If the tenant email doesn't exist, proceed to add it
            const password = generateUniquePassword();
            const encryptedPassword = encryptPassword(password);
            const tenentCredsData = {
                email: tenantEmail,
                password: encryptedPassword,
                role: 'user', 
                token: generateToken() // Generate a token for the user
            };

            await addDoc(collection(db, 'tenantCreds'), tenentCredsData);
            console.log('TenantCreds data saved successfully');

            setLoading(false);
            return { email: tenantEmail, password }; // Return the generated email and password
        } catch (error) {
            setLoading(false);
            setError('Failed to save tenentCredsData: ' + error.message);
            return false; // Indicate failure
        }
    };


    const generateUniquePassword = () => {
        const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += alphanumericChars.charAt(Math.floor(Math.random() * alphanumericChars.length));
        }
        return password;
    };

    const encryptPassword = (password) => {
        // Using AES encryption
        const encryptedPassword = CryptoJS.AES.encrypt(password, 'this@is@secret@key__').toString();
        return encryptedPassword;
    };

    return { loading, error, addTenentCreds };
};

export default useAddTenentCreds;
