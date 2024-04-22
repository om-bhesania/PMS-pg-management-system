import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const useFirestoreData = () => {
    const [eleBill, setEleBill] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "eleBill"),
            (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEleBill(data);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            } 
        );

        // Cleanup on component unmount
        return () => unsubscribe();
    }, []); // Empty dependency array ensures it runs once when the component mounts

    return {
        loading,
        error,
        eleBill,
    };
};

export default useFirestoreData;
