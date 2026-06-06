import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadPhoto = async (file) => {

  const fileRef = ref(storage, "dogs/" + Date.now() + "_" + file.name);

  await uploadBytes(fileRef, file);

  return await getDownloadURL(fileRef);

};