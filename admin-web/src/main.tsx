import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { App } from "./App";
import { SearchProvider } from "./context/SearchContext";
import { LocaleProvider } from "./context/LocaleContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BASE_PATH } from "./lib/basePath";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin + BASE_PATH }}
    >
      <BrowserRouter basename={BASE_PATH || "/"}>
        <ThemeProvider>
          <LocaleProvider>
            <SearchProvider>
              <App />
            </SearchProvider>
          </LocaleProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
);
