import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const useAddData = () => {
  // Function to add a new tenant and return the document ID
  const addTenants = async (tenantData) => {
    try {
      const tenantsCollection = collection(db, "tenants");
      const docRef = await addDoc(tenantsCollection, tenantData);

      // Listen for real-time updates to ensure the document is added
      onSnapshot(
        docRef,
        (doc) => {
          if (!doc.exists()) {
            console.warn("Document not found after adding");
          } else {
            console.log("Tenant added successfully:", doc.data());
          }
        },
        (error) => {
          console.error("Error listening to tenant document:", error);
        }
      );

      return docRef.id;
    } catch (e) {
      console.error("Error adding tenant document:", e);
      throw e;
    }
  };

  // Function to add a notification and return the document ID
  const sendNotify = async (notifyData) => {
    try {
      const notificationsCollection = collection(db, "notifications");
      const docRef = await addDoc(notificationsCollection, notifyData);

      onSnapshot(
        docRef,
        (doc) => {
          if (!doc.exists()) {
            console.warn("Notification document not found after adding");
          } else {
            console.log("Notification added successfully:", doc.data());
          }
        },
        (error) => {
          console.error("Error listening to notification document:", error);
        }
      );

      return docRef.id;
    } catch (e) {
      console.error("Error adding notification document:", e);
      throw e;
    }
  };

  // Function to add an electricity bill and return the document ID
  const addElectricityBill = async (tenantEleData) => {
    try {
      const eleBillCollection = collection(db, "eleBill");
      const docRef = await addDoc(eleBillCollection, tenantEleData);

      onSnapshot(
        docRef,
        (doc) => {
          if (!doc.exists()) {
            console.warn("Electricity bill document not found after adding");
          } else {
            console.log("Electricity bill added successfully:", doc.data());
          }
        },
        (error) => {
          console.error("Error listening to electricity bill document:", error);
        }
      );

      return docRef.id;
    } catch (e) {
      console.error("Error adding electricity bill document:", e);
      throw e;
    }
  };

  return { addTenants, addElectricityBill, sendNotify };
};

export default useAddData;
