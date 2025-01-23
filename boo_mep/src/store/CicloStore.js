import {create} from "zustand";

const useCicloStore = create((set) => ({
    cicloId: null,
    setCicloId: (Cic_Id) => set({ cicloId: Cic_Id }),
  }));
  
  export default useCicloStore;