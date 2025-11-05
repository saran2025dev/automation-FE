import CryptoJS from "crypto-js";

const SECRET_KEY = "1_secret_2_key_3_for_4_invader_5_app_6"

export const encrypt = (key, data) => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();
    localStorage.setItem(key, ciphertext);
  } catch (err) {
    console.error("Encryption failed:", err);
  }
};

export const decrypt = (key) => {
  try {
    const ciphertext = localStorage.getItem(key);
    if (!ciphertext) return null;
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};
