import {create} from "zustand";

const usePeriodoStore = create((set) => ({
    periodoId: null,
    setPeriodoId: (Per_Id) => set({ periodoId: Per_Id }),
  }));
  
  export default usePeriodoStore;