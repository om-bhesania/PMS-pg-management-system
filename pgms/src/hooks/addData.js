import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const addData = () => {
  const addTenents = async (tenentData) => {
    try {
      const docRef = await addDoc(collection(db, "tenents"), tenentData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  };
  const addElectricityBill = async (tenentEleData) => {
    try {
      const docRef = await addDoc(collection(db, "eleBill"), tenentEleData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  };
  return { addTenents, addElectricityBill };
};

export default addData;
