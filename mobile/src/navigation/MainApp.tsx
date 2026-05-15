import React, { useState } from "react";
import Setup from "./Setup";
import MainScreen from "../screens/MainScreen";

const SKIP_SETUP = true;

interface Props {
	theme: any;
}

export default function MainApp({ theme }: Props) {
	const [isSetupComplete, setIsSetupComplete] = useState(SKIP_SETUP);

	return isSetupComplete ? (
		<MainScreen theme={theme} onLogout={() => setIsSetupComplete(false)} />
	) : (
		<Setup theme={theme} onComplete={() => setIsSetupComplete(true)} />
	);
}
