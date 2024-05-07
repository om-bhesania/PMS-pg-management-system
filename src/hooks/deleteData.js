import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Assuming db is your Firestore instance

const useDeleteData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteData = async (collectionName, documentId) => {
        setLoading(true);
        setError(null);
        try {
            const docRef = doc(db, collectionName, documentId);
            await deleteDoc(docRef);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, deleteData };
};

export default useDeleteData;
