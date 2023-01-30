import { create } from "zustand";

interface GlobalState {
  sessionRequiredTrigger: [number, string];
  setSessionRequiredTrigger: (description?: string) => void;
  removeSessionRequired: () => void;
  generalDialogueTrigger: [
    number,
    { title: string; description: string; close: string }
  ];
  setDialogueTrigger: (contents: {
    title: string;
    description: string;
    close: string;
  }) => void;
  removeDialogue: () => void;
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
  generalDialogueTrigger: [0, { title: "", description: "", close: "ok" }],
  setDialogueTrigger: (contents: {
    title: string;
    description: string;
    close: string;
  }) =>
    set((state) => ({
      generalDialogueTrigger: [state.generalDialogueTrigger[0] + 1, contents],
    })),
  removeDialogue: () =>
    set({
      generalDialogueTrigger: [0, { title: "", description: "", close: "ok" }],
    }),
}));

export default useGlobalStore;
