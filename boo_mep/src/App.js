import { Route, Routes, Navigate, HashRouter,} from "react-router-dom";
import React from 'react';

import LoginPage from "./Paginas/LoginPage";
import RegistroProfesorPage from "./Paginas/RegistroProfesorPage";
import MenuPage from "./Paginas/MenuPage";
import MenuDatosImportantesPage from "./Paginas/MenuDatosImportantesPage";
import InstitucionesPage from "./Paginas/InstitucionPage";
import StepsFormPage from "./Paginas/StepsFormPage";


export function App() {
  return (
    <HashRouter>
     
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/RegistroProfesorPage" element={<RegistroProfesorPage />} />
          <Route path="/MenuPage" element={<MenuPage />} />
          <Route path="/MenuDatosImportantesPage" element={<MenuDatosImportantesPage />} />
          <Route path="/InstitucionesPage" element={<InstitucionesPage />} />
          <Route path="/StepsFormPage" element={<StepsFormPage />} />
          

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
     
    </HashRouter>
  );
}

