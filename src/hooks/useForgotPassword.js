import { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import CryptoJS from 'crypto-js';

const useForgetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const forgetPassword = async (email) => {
        setLoading(true);
        try {
            // Check if email exists in tenentCreds collection
            const tenentCredsQuery = query(collection(db, 'tenentCreds'), where('email', '==', email));
            const querySnapshot = await getDocs(tenentCredsQuery);
            
            if (querySnapshot.empty) {
                throw new Error('Email not found');
            }

            // Generate a new random password
            const newPassword = generateUniquePassword();

            // Encrypt the new password
            const encryptedPassword = encryptPassword(newPassword);

            // Update the password in the database
            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, { password: encryptedPassword });
            });

            setLoading(false);
            setSuccess(true);
        } catch (error) {
            setLoading(false);
            setError('Failed to reset password: ' + error.message);
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
        const encryptedPassword = CryptoJS.AES.encrypt(password, 'secret_key').toString();
        return encryptedPassword;
    };

    return { loading, error, success, forgetPassword };
};

export default useForgetPassword;
