import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Assuming db is your Firestore instance

const useGetData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenents, setTenents] = useState([]);

  const fetchTenents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Perform data fetching only if the cache is empty or outdated
      if (tenents.length === 0) {
        const querySnapshot = await getDocs(collection(db, "tenents"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTenents(data);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data only when the component mounts for the first time
    fetchTenents();
  }, []);

  return { loading, error, tenents, fetchTenents };
};

export default useGetData;
