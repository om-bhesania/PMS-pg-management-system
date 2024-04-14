import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const useLoggedInUserData = (isLoggedIn, emailInitial) => {
  const [loggedInUserData, setLoggedInUserData] = useState(null);

  useEffect(() => {
    const getLoggedInUserData = async () => {
      if (isLoggedIn && emailInitial) {
        try {
          const masterDataQuerySnapshot = await getDocs(query(collection(db, "MasterTenantsData"), where("email", "==", emailInitial.toLowerCase())));
          if (!masterDataQuerySnapshot.empty) {
            const loggedInUserDoc = masterDataQuerySnapshot.docs[0];
            const userData = loggedInUserDoc.data();
            setLoggedInUserData(userData);
          } else {
            console.log(`User data not found for email initial: ${emailInitial}`);
            setLoggedInUserData(null);
          }
        } catch (error) {
          console.error("Error fetching logged-in user data:", error);
          setLoggedInUserData(null);
        }
      } else {
        setLoggedInUserData(null);
      }
    };

    getLoggedInUserData();
  }, [isLoggedIn, emailInitial]);

  return loggedInUserData;
};

export default useLoggedInUserData;
