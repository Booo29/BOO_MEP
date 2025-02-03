import { Route, Routes, Navigate, HashRouter,} from "react-router-dom";
import React from 'react';

import LoginPage from "./Paginas/LoginPage";
import RegistroProfesorPage from "./Paginas/RegistroProfesorPage";
import MenuPage from "./Paginas/MenuPage";
import InstitucionesPage from "./Paginas/InstitucionPage";
import StepsFormPage from "./Paginas/StepsFormPage";
import AsistenciaPage from "./Paginas/AsistenciaPage";
import EvaluacionesPage from "./Paginas/EvaluacionesPage";
import EvaluacionesStepFormPage from "./Paginas/EvaluacionesStepFormPage";
import EvaluacionEstudiantePage from "./Paginas/EvaluacionEstudiantePage";
import ListasPage from "./Paginas/ListasPage";
import InformesPage from "./Paginas/InformesPage";
import TutorialesPage from "./Paginas/TutorialesPage";

export function App() {
  return (
    <HashRouter>
     
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/RegistroProfesorPage" element={<RegistroProfesorPage />} />
          <Route path="/MenuPage" element={<MenuPage />} />
          <Route path="/InstitucionesPage" element={<InstitucionesPage />} />
          <Route path="/StepsFormPage" element={<StepsFormPage />} />
          <Route path="/AsistenciaPage" element={<AsistenciaPage />} />
          <Route path="/EvaluacionesPage" element={<EvaluacionesPage />} />
          <Route path="/EvaluacionesStepFormPage" element={<EvaluacionesStepFormPage />} />
          <Route path="/EvaluacionEstudiantePage" element={<EvaluacionEstudiantePage />} />
          <Route path="/ListasPage" element={<ListasPage />} />
          <Route path="/InformesPage" element={<InformesPage />} />
          <Route path="/TutorialesPage" element={<TutorialesPage />} />
          

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
     
    </HashRouter>
  );
}

