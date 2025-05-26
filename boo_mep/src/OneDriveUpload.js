import React, { useState, useEffect, useRef } from "react";
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "ab3196be-204f-47fa-b21d-beea4867e654",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const OneDriveUpload = ({ respaldoUrl }) => {
  const [status, setStatus] = useState("");
  const msalInitialized = useRef(false); // referencia para saber si ya inicializó

  useEffect(() => {
    const initializeMsal = async () => {
      console.log("Inicializando MSAL...");
      if (!msalInitialized.current) {
        await msalInstance.initialize(); // ← solución al error
        msalInitialized.current = true;
        console.log("MSAL inicializado");
      }
    };

    initializeMsal();
  }, []);

  const loginAndUpload = async () => {
    try {
      if (!msalInitialized.current) {
        setStatus("Inicializando MSAL...");
        await msalInstance.initialize();
        msalInitialized.current = true;
      }

      setStatus("Iniciando sesión...");
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["Files.ReadWrite"],
      });

      const accessToken = loginResponse.accessToken;

      setStatus("Descargando respaldo...");
      const fileBlob = await fetch(respaldoUrl).then((res) => res.blob());

      setStatus("Subiendo a OneDrive...");
      const uploadRes = await fetch(
        "https://graph.microsoft.com/v1.0/me/drive/root:/respaldo.sql:/content",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: fileBlob,
        }
      );

      if (uploadRes.ok) {
        const result = await uploadRes.json();
        setStatus(`✅ Subido a OneDrive: ${result.name}`);
      } else {
        const errorRes = await uploadRes.text();
        console.error("Error de subida:", errorRes);
        setStatus("❌ Error al subir a OneDrive");
      }
    } catch (error) {
      console.error("Error general:", error);
      setStatus("❌ Error de autenticación o subida");
    }
  };

  return (
    <div>
      <button onClick={loginAndUpload}>Subir respaldo a OneDrive</button>
      <p>{status}</p>
    </div>
  );
};

export default OneDriveUpload;
