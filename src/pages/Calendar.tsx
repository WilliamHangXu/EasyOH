// NOTE: This is not in use.
import { gapi } from "gapi-script";
import { useEffect } from "react";

const CLIENT_ID =
  "737738370870-p7k6p9ins0jnmavv8j6vh9f81enbbuo4.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const SCOPES = "https://www.googleapis.com/auth/calendar";

const useGoogleAPI = () => {
  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
        })
        .then(() => {
          console.log("Google API initialized");
        });
    };

    gapi.load("client:auth2", initClient);
  }, []);
};

export default useGoogleAPI;
