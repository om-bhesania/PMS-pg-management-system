import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const useGetData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [tenantCreds, setTenantCreds] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [Role, setRole] = useState(null);

  // Fetch and listen for tenants data
  useEffect(() => {
    const tenantsCollection = collection(db, "tenants");
    const unsubscribe = onSnapshot(
      tenantsCollection,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTenants(data);
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Error fetching tenants:", snapshotError);
        setError(snapshotError);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch and listen for tenant credentials
  useEffect(() => {
    const tenantCredsCollection = collection(db, "tenantCreds");
    const unsubscribe = onSnapshot(
      tenantCredsCollection,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTenantCreds(data);
      },
      (snapshotError) => {
        console.error("Error fetching tenant credentials:", snapshotError);
        setError(snapshotError);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch and listen for master data
  useEffect(() => {
    const masterDataCollection = collection(db, "MasterTenantsData");
    const unsubscribe = onSnapshot(
      masterDataCollection,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMasterData(data);
      },
      (snapshotError) => {
        console.error("Error fetching master data:", snapshotError);
        setError(snapshotError);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchCurrentUserDetails = () => {
    const role = sessionStorage.getItem("role");
    setRole(role);
  };

  useEffect(() => {
    fetchCurrentUserDetails();
  }, []);

  const mergeTenantData = async () => {
    try {
      const masterDatabaseData = [];

      tenants.forEach(async (tenantDoc) => {
        const tenantData = {
          id: tenantDoc.id,
          ...tenantDoc,
        };

        const tenantEmail = tenantData.tenantEmail;

        // Find the corresponding tenantCred
        const matchingTenantCred = tenantCreds.find(
          (cred) => cred.email === tenantEmail
        );

        if (matchingTenantCred) {
          const masterTenantData = {
            ...tenantData,
            ...matchingTenantCred,
          };

          // Check if the document already exists in MasterTenantsData
          const existingMasterData = masterData.find(
            (master) => master.tenantEmail === tenantEmail
          );

          if (!existingMasterData) {
            await addDoc(collection(db, "MasterTenantsData"), masterTenantData);
          } else {
            console.log(
              `Document for ${tenantEmail} already exists in MasterTenantsData.`
            );
          }

          masterDatabaseData.push(masterTenantData);
        }
      });

      console.log("Merge completed successfully.");
    } catch (error) {
      console.error("Error merging tenant data:", error);
      setError(error);
    }
  };

  return {
    loading,
    error,
    tenants,
    tenantCreds,
    masterData,
    Role,
    mergeTenantData,
  };
};

export default useGetData;
