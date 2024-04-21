// useFirestoreData.js
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

const useFirestoreData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [eleBill, setEleBill] = useState([]);
  
    useEffect(() => {
      const fetchEleBill = async () => {
        setLoading(true);
        setError(null);
        try {
          const querySnapshot = await getDocs(collection(db, "eleBill"));
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEleBill(data);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchEleBill();
    }, []);
  
    return {
      loading,
      error,
      eleBill,
    };
  };
  
export default useFirestoreData;
