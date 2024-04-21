import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const useElectricityBill = () => {
  const addElectricityBill = async (electricityBillData) => {
    try {
      const { tenantId } = electricityBillData;
      const exists = await checkElectricityBillExists(tenantId);

      if (exists) {
        // Update existing record
        await updateElectricityBill(electricityBillData);
      } else {
        // Add new record
        await addDoc(collection(db, "eleBill"), electricityBillData);
      }
    } catch (e) {
      console.error("Error adding electricity bill: ", e);
      throw e;
    }
  };

  const checkElectricityBillExists = async (tenantId) => {
    try {
      const q = query(collection(db, "eleBill"), where("tenantId", "==", tenantId));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (e) {
      console.error("Error checking electricity bill existence: ", e);
      throw e;
    }
  };

  const updateElectricityBill = async (electricityBillData) => {
    try {
      const { tenantId } = electricityBillData;
      const q = query(collection(db, "eleBill"), where("tenantId", "==", tenantId));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, electricityBillData);
      });
    } catch (e) {
      console.error("Error updating electricity bill: ", e);
      throw e;
    }
  };

  return { addElectricityBill, checkElectricityBillExists };
};

export default useElectricityBill;
