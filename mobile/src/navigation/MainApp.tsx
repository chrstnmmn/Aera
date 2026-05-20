import React, { useState } from "react";
import Setup from "./Setup";
import MainScreen from "../screens/MainScreen";

const SKIP_SETUP = true;

interface MainAppProps {
  theme: any; 
  ws: WebSocket | null; 
}

export default function MainApp({ theme, ws }: MainAppProps) {
  const [isSetupComplete, setIsSetupComplete] = useState(SKIP_SETUP);

  return isSetupComplete ? (
    <MainScreen 
      theme={theme} 
      onLogout={() => setIsSetupComplete(false)} 
      ws={ws} 
    />
  ) : (
    <Setup theme={theme} onComplete={() => setIsSetupComplete(true)} />
  );
}