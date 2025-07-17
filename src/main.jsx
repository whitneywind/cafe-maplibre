import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme.js';
import './styles/fonts.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
  </StrictMode>
);
