import { createContext, useContext, useState, ReactNode } from "react";

type CallType = "audio" | "video";

interface CallState {
  type: CallType;
  caller: any;
  callee: any;
  callId: string;
}

interface CallStateContextProps {
  call: CallState | null;
  setCall: (data: CallState | null) => void;
}

const CallStateContext = createContext<CallStateContextProps>(null!);

export const CallStateProvider = ({ children }: { children: ReactNode }) => {
  const [call, setCall] = useState<CallState | null>(null);

  return (
    <CallStateContext.Provider value={{ call, setCall }}>
      {children}
    </CallStateContext.Provider>
  );
};

export const useCallState = () => useContext(CallStateContext);
