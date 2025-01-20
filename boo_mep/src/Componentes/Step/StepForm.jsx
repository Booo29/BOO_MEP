import React, { useState } from 'react';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import InstitutionInfoStep from './steps/InstitutionInfoStep'; 
import MateriasStep from './steps/MateriasStep'; 
import CiclosStep from './steps/CiclosStep';
// import PeriodosStep from './steps/PeriodosStep';
// import EvaluacionesStep from './steps/EvaluacionesStep';
// import SeccionesStep from './steps/SeccionesStep';

const StepsForm = () => {
  const [activeStep, setActiveStep] = useState(0);

  

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Función para retroceder al paso anterior
  const handlePrevious = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Definir los pasos de la aplicación
  const steps = [
    { label: 'Información de la Institución' },
    { label: 'Materias' },
    { label: 'Ciclos' },
    { label: 'Periodos' },
    { label: 'Evaluaciones' },
    { label: 'Secciones' },
  ];

  return (
    <div>
      <Steps model={steps} activeIndex={activeStep} style={{marginTop: '40px'}} />
      <div className="step-content" style={{ marginTop: '20px', minHeight: '150px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        {/* Aquí se renderiza el componente correspondiente según el paso activo */}
        {activeStep === 0 && <InstitutionInfoStep/>}
        {activeStep === 1 && <MateriasStep/>}
        {activeStep === 2 && <CiclosStep/>}
        {/* {activeStep === 3 && <PeriodosStep formData={formData} setFormData={setFormData} />}
        {activeStep === 4 && <EvaluacionesStep formData={formData} setFormData={setFormData} />}
        {activeStep === 5 && <SeccionesStep formData={formData} setFormData={setFormData} />} */}
      </div>
      <div className="step-navigation" style={{ textAlign: 'right', marginRight: '20px' }}>
        <Button onClick={handlePrevious} disabled={activeStep === 0} style={{ marginRight: '8px' }}>
          Anterior
        </Button>
        <Button onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Guardar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

export default StepsForm;
