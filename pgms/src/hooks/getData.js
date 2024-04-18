import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

const useGetData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [tenantCreds, setTenantCreds] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [Role, setRole] = useState([]);
  const [masterDatabase, setMasterDatabase] = useState([]);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tenants.length === 0) {
        const querySnapshot = await getDocs(collection(db, "tenants"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTenants(data);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantCreds = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tenantCreds.length === 0) {
        const querySnapshot = await getDocs(collection(db, "tenantCreds"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTenantCreds(data);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (masterData.length === 0) {
        const querySnapshot = await getDocs(
          collection(db, "MasterTenantsData")
        );
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMasterData(data);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const mergeTenantData = async () => {
    try {
      const tenantsQuerySnapshot = await getDocs(collection(db, "tenants"));

      const masterDatabaseData = [];

      tenantsQuerySnapshot.forEach(async (tenantDoc) => {
        const tenantData = tenantDoc.data();
        const tenantEmail = tenantData.tenantEmail;

        const matchingTenantCredsQuerySnapshot = await getDocs(
          query(
            collection(db, "tenantCreds"),
            where("email", "==", tenantEmail)
          )
        );
        if (!matchingTenantCredsQuerySnapshot.empty) {
          const matchingTenantCredsDoc =
            matchingTenantCredsQuerySnapshot.docs[0];
          const tenantCredsData = matchingTenantCredsDoc.data();

          const masterTenantData = {
            ...tenantData,
            ...tenantCredsData,
          };

          // Check if the document already exists in MasterTenantsData collection
          const masterDataQuerySnapshot = await getDocs(
            query(
              collection(db, "MasterTenantsData"),
              where("tenantEmail", "==", tenantEmail)
            )
          );
          if (masterDataQuerySnapshot.empty) {
            // If not found, add it to the collection
            await addDoc(collection(db, "MasterTenantsData"), masterTenantData);
          } else {
            console.log(
              `Document for ${tenantEmail} already exists in MasterTenantsData.`
            );
          }

          masterDatabaseData.push(masterTenantData);
        }
      });

      setMasterDatabase(masterDatabaseData);
      console.log("Merge completed successfully.");
    } catch (error) {
      console.error("Error merging tenant data:", error);
    }
  };

  const fetchCurrentUserDetails = () => {
    const Role = sessionStorage.getItem("role");
    setRole(Role);
  };
  useEffect(() => {
    fetchTenants();
    fetchTenantCreds();
    fetchMasterData();
    fetchCurrentUserDetails();
  }, []);

  return {
    loading,
    error,
    tenants,
    Role,
    tenantCreds,
    masterData,
    fetchMasterData,
    fetchTenants,
    mergeTenantData,
  };
};

export default useGetData;
