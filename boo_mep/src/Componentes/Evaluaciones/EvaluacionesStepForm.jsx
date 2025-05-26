import React, { useState } from 'react';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

import CrearEvaluacion from './CrearEvaluacion';
import CrearIndicadoresyNiveles from './CrearIndicadoresyNiveles';


const EvaluacionesStepForm = () => {

  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);


  const handleNext = () => {
    if(activeStep  === steps.length - 1){
      navigate('/EvaluacionesPage');
    }
    else{
      setActiveStep((prevStep) => prevStep + 1);
    }
    
  };

  
  const handlePrevious = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  
  const steps = [
    { label: 'Información de la evaluación' },
    { label: 'Indicadores y Niveles de desempeño' },
  ];

  const handleMenu = () => {
    navigate('/EvaluacionesPage');
  }

  return (
    <div style={{ padding: "16px" }}>
      <Button label="Regresar" severity="help" onClick={handleMenu} />
      <Steps model={steps} activeIndex={activeStep} style={{marginTop: '40px'}} />
      <div className="step-content" style={{ marginTop: '20px', minHeight: '150px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        {activeStep === 0 && <CrearEvaluacion/>}
        {activeStep === 1 && <CrearIndicadoresyNiveles/>}
        
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

export default EvaluacionesStepForm;
