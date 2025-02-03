import {create} from "zustand";

const useMateriaStore = create((set) => ({
    materiaNombre: null,
    setMateriaNombre: (Mat_Nombre) => set({ materiaNombre: Mat_Nombre }),
  }));
  
  export default useMateriaStore;