import { create } from "zustand";

type CallInfo = {
  type: "audio" | "video";
  callId: string;
  caller: { name: string };
  callee: { name?: string };
  token?: string | null;
};

type CallStore = {
  activeCall: CallInfo | null;
  setCall: (call: CallInfo) => void;
  endCall: () => void;
};

export const useCallStore = create<CallStore>((set) => ({
  activeCall: null,

  setCall: (call) => set({ activeCall: call }),

  endCall: () => set({ activeCall: null }),
}));
