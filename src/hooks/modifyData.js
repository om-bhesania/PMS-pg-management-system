import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Assuming db is your Firestore instance

const useModifyData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modifyData = async (collectionName, documentId, newData) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, newData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, modifyData };
};

export default useModifyData;
