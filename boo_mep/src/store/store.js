import {create} from "zustand";

const useStore = create((set) => ({
  institutionId: null,
  setInstitutionId: (Inst_Id) => set({ institutionId: Inst_Id }),
}));

export default useStore;
