import {create} from "zustand";

const useGradoStore = create((set) => ({
    gradoNombre: null,
    setGradoNombre: (Gra_Nombre) => set({ gradoNombre: Gra_Nombre }),
  }));
  
  export default useGradoStore;