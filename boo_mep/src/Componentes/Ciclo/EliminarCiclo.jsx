import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { deleteCiclo } from "../../Servicios/CicloService";

import useCicloStore from "../../store/CicloStore";

const EliminarCiclo = () => {

  const cicloId = useCicloStore((state) => state.cicloId);

  const navigate = useNavigate();

  const handleDeleteCiclo = () => {
    deleteCiclo(cicloId)
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Ciclo eliminado",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/InstitucionesPage");
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar el ciclo",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/MenuPage");
        });
    };

  return (
    <div>
        <Dialog
            header="Eliminar Ciclo"
            visible={true}
            style={{ width: "50vw" }}
            modal={true}
            onHide={() => navigate("/MenuPage")}
            footer={
            <div>
                <Button
                label="Eliminar"
                icon="pi pi-times"
                onClick={handleDeleteCiclo}
                className="p-button-danger"
                />
                <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={() => navigate("/MenuPage")}
                className="p-button-secondary"
                />
            </div>
            }
        >
            <div>
            <p>¿Estás seguro que deseas eliminar este ciclo?</p>
            </div>
        </Dialog>
    </div>
  );
};

export default EliminarCiclo;
