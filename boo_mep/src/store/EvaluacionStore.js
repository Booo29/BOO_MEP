import {create} from "zustand";

const useEvaluacionStore = create((set) => ({
    evaluacionId: null,
    setEvaluacionId: (Eva_Id) => set({ evaluacionId: Eva_Id }),
  }));
  
export default useEvaluacionStore;