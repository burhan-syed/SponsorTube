import { create } from "zustand";

interface GlobalState {
  sessionRequiredTrigger: [number, string];
  setSessionRequiredTrigger: (description?: string) => void;
  removeSessionRequired: () => void;
}

const useGlobalStore = create<GlobalState>((set) => ({
  sessionRequiredTrigger: [0, ""],
  setSessionRequiredTrigger: (description?: string) =>
    set((state) => ({
      sessionRequiredTrigger: [
        state.sessionRequiredTrigger[0] + 1,
        description ?? "",
      ],
    })),
  removeSessionRequired: () => set({ sessionRequiredTrigger: [0, ""] }),
}));

export default useGlobalStore;
