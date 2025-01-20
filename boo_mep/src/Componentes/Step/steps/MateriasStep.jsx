import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { getMaterias} from "../../../Servicios/MateriaService";
import { getMateriasInstitucion, postMateriaInstitucion, deleteMateriaInstitucion } from "../../../Servicios/MateriaInstitucionService";
import useStore from "../../../store/store";

const MateriasStep = () => {
  const institutionId = useStore((state) => state.institutionId);
  const [allMaterias, setAllMaterias] = useState([]);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [availableMaterias, setAvailableMaterias] = useState([]);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");

  console.log('institutionId', institutionId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materias = await getMaterias();
        const materiasInstitucion = await getMateriasInstitucion(institutionId);

        const selected = materiasInstitucion.map((m) => ({
          id: m.Mat_Id,
          name: m.Mat_Nombre,
          matInsId: m.Mat_Ins_Id,
        }));

        const available = materias
          .filter((m) => !selected.some((sel) => sel.id === m.Mat_Id))
          .map((m) => ({ id: m.Mat_Id, name: m.Mat_Nombre }));

        setAllMaterias(materias);
        setSelectedMaterias(selected);
        setAvailableMaterias(available);
      } catch (error) {
        console.error("Error loading materias:", error);
      }
    };

    fetchData();
  }, [institutionId]);

//   const handleAddMaterias = () => {
//     const selected = availableMaterias.filter((m) =>
//       searchAvailable ? m.name.toLowerCase().includes(searchAvailable.toLowerCase()) : true
//     );
//     setSelectedMaterias([...selectedMaterias, ...selected]);
//     setAvailableMaterias(availableMaterias.filter((m) => !selected.includes(m)));
//   };

    const handleAddMateria = async (materia) => {
        try {
            console.log('materia', materia);
            await postMateriaInstitucion({
                materias: [{ idMateria: materia.id, idInstitucion: institutionId }],
            });
            Swal.fire({
                title: "Guardado",
                text: "La materia ha sido agregada",
                icon: "success",
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
            })
            setSelectedMaterias([...selectedMaterias, materia]);
            setAvailableMaterias(availableMaterias.filter((m) => m.id !== materia.id));
        } catch (error) {
            console.error("Error adding materia:", error);
        }
        // setSelectedMaterias([...selectedMaterias, materia]);
        // setAvailableMaterias(availableMaterias.filter((m) => m.id !== materia.id));
    };

    const handleRemoveMateria = async (materiaId) => {
        // setAvailableMaterias([...availableMaterias, materia]);
        // setSelectedMaterias(selectedMaterias.filter((m) => m.id !== materia.id));
        try {
            console.log('materiaId', materiaId);
            await deleteMateriaInstitucion(materiaId);
            Swal.fire({
                title: "Eliminado",
                text: "La materia ha sido eliminada de tu lista",
                icon: "success",
                position: "top-end",
                showConfirmButton: false,
                timer: 1500,
            })
            setSelectedMaterias(selectedMaterias.filter((m) => m.matInsId !== materiaId));
            setAvailableMaterias([...availableMaterias, selectedMaterias.find((m) => m.matInsId === materiaId)]);
        } catch (error) {
            console.error("Error deleting materia:", error);
        }
   
    };

//   const handleRemoveMaterias = () => {
//     const removed = selectedMaterias.filter((m) =>
//       searchSelected ? m.name.toLowerCase().includes(searchSelected.toLowerCase()) : true
//     );
//     setAvailableMaterias([...availableMaterias, ...removed]);
//     setSelectedMaterias(selectedMaterias.filter((m) => !removed.includes(m)));
//   };

//   const handleSave = async () => {
//     try {
//       const currentIds = selectedMaterias.map((m) => m.id);
//       const previousIds = allMaterias.filter((m) => selectedMaterias.some((sel) => sel.id === m.Mat_Id));

//       // Add new
//       const newMaterias = selectedMaterias.filter((m) => !previousIds.includes(m.id));
//       await postMateriaInstitucion({
//         materias: newMaterias.map((m) => ({ idMateria: m.id, idInstitucion: institutionId })),
//       });

//       // Remove old
//       const removedMaterias = previousIds.filter((id) => !currentIds.includes(id));
//       for (const mat of removedMaterias) {
//         await deleteMateriaInstitucion(mat.matInsId);
//       }

//       alert("Materias guardadas con éxito.");
//     } catch (error) {
//       console.error("Error saving materias:", error);
//     }
//   };

    // const handleSave = async () => {
    //     try {
    //     // const currentIds = selectedMaterias.map((m) => m.id);
    //     const previousIds = allMaterias.filter((m) => selectedMaterias.some((sel) => sel.id === m.Mat_Id));

    //     // Add new
    //     const newMaterias = selectedMaterias.filter((m) => !previousIds.includes(m.id));
    //     await postMateriaInstitucion({
    //         materias: newMaterias.map((m) => ({ idMateria: m.id, idInstitucion: institutionId })),
    //     });

    //     // Remove old
    //     // const removedMaterias = previousIds.filter((id) => !currentIds.includes(id));
    //     // for (const mat of removedMaterias) {
    //     //     await deleteMateriaInstitucion(mat.matInsId);
    //     // }

    //     alert("Materias guardadas con éxito.");
    //     } catch (error) {
    //     console.error("Error saving materias:", error);
    //     }
    // };

  return (
    <div>
      <div className="p-grid">
        <div className="p-col-5">
          <h3>Materias Disponibles</h3>
          <InputText
            value={searchAvailable}
            onChange={(e) => setSearchAvailable(e.target.value)}
            placeholder="Buscar..."
            className="p-mb-3"
          />
          <ListBox
            options={availableMaterias.filter((m) =>
              m.name.toLowerCase().includes(searchAvailable.toLowerCase())
            )}
            optionLabel="name"
            className="w-full"
            itemTemplate={(materia) => (
                <div className="flex justify-content-between align-items-center">
                    <span>{materia.name}</span>
                    <Button
                    icon="pi pi-plus"
                    className="p-button-text p-button-success"
                    style={{ padding: 0 }}
                    onClick={() => handleAddMateria(materia)}
                    />
                </div>
            )}
          />
        </div>

        <div className="p-col-5">
          <h3>Materias Seleccionadas</h3>
          <InputText
            value={searchSelected}
            onChange={(e) => setSearchSelected(e.target.value)}
            placeholder="Buscar..."
            className="p-mb-3"
          />
          <ListBox
            options={selectedMaterias.filter((m) =>
              m.name.toLowerCase().includes(searchSelected.toLowerCase())
            )}
            optionLabel="name"
            className="w-full"
            itemTemplate={(materia) => (
                <div className="flex justify-content-between align-items-center">
                    <span>{materia.name}</span>
                    <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-danger"
                    style={{ padding: 0 }}
                    onClick={() => handleRemoveMateria(materia.matInsId)}
                    />
                </div>
            )}
          />
        </div>
      </div>
      {/* <Button
        label="Guardar"
        severity="success"
        style={{ marginTop: "1rem" }}
        onClick={handleSave}
      /> */}
    </div>
  );
};

export default MateriasStep;
