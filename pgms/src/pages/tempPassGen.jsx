import { useState } from 'react';
import CryptoJS from 'crypto-js';

const TempPassGen = () => {
    const [decryptedPassword, setDecryptedPassword] = useState('');
    const [inputPassword, setInputPassword] = useState('');

    const handleDecrypt = (e) => {
        e.preventDefault( );
        const decrypted = CryptoJS.AES.decrypt(
          inputPassword,
          "this@is@secret@key__"
        ).toString(CryptoJS.enc.Utf8);
        setDecryptedPassword(decrypted);
    };

    return (
      <div>
        <form>
          <label>
            Encrypted Password:
            <input
              type="text"
              value={inputPassword}
              onChange={(e) => {
                e.preventDefault();
                setInputPassword(e.target.value);
              }}
            />
          </label>
          {inputPassword && (
            <button
              className="ms-2 border border-primary p-2"
              onClick={handleDecrypt}
            >
              Decrypt
            </button>
          )}
        </form>
        {inputPassword && (
          <div className=" flex flex-col gap-4 items-start  ">
            <span> Decrypted Password: {decryptedPassword}</span>
          </div>
        )}
      </div>
    );
};

export default TempPassGen;
