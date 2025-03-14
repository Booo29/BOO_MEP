import React, { useState } from 'react';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import CiclosStep from './steps/CiclosStep';
import GradoSeccionesStep from './steps/GradoSeccionesStep';
import GradoSeccionMateriaStep from './steps/GradoSeccionMateriaStep';
import RubrosEvaluacionStep from './steps/RubrosEvaluacionStep';
import IngresoEstudiantesStep from './steps/IngresoEstudiantesStep';
import { useNavigate } from 'react-router-dom';

const StepsForm = () => {

  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);


  const handleNext = () => {
    if(activeStep  === steps.length - 1){
      navigate('/InstitucionesPage');
    }
    else{
      setActiveStep((prevStep) => prevStep + 1);
    }
    
  };

  
  const handlePrevious = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  
  const steps = [
    { label: 'Ciclos y Periodos' },
    { label: 'Grados y Secciones' },
    { label: 'Materias' },
    { label: 'Rubros de Evaluación' },
    { label: 'Añadir estudiantes' },
  ];

  return (
    <div>
      <Steps model={steps} activeIndex={activeStep} style={{marginTop: '40px'}} />
      <div className="step-content" style={{ marginTop: '20px', minHeight: '150px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        {activeStep === 0 && <CiclosStep/>}
        {activeStep === 1 && <GradoSeccionesStep/>}
        {activeStep === 2 && <GradoSeccionMateriaStep/>}
        {activeStep === 3 && <RubrosEvaluacionStep/>}
        {activeStep === 4 && <IngresoEstudiantesStep/>}
      </div>
      <div className="step-navigation" style={{ textAlign: 'right', marginRight: '20px' }}>
        <Button onClick={handlePrevious} disabled={activeStep === 0} style={{ marginRight: '8px' }}>
          Anterior
        </Button>
        <Button onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

export default StepsForm;
