import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
} from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	Animated,
} from "react-native";
import NavigationBar from "../components/ui/NavigationBar";
import AeraStatusBar from "../components/ui/AeraStatusBar";
import AeraTitlebar from "../components/ui/AeraTitlebar";
import SystemMonitor from "../components/ui/SystemMonitor";
import TimerCard from "../components/ui/TimerCard";
import QuickActionCard, {
	QuickActionState,
} from "../components/ui/QuickActionCard";
import TimerPickerCard from "../components/ui/TimerPickerCard";
import type { TimerPickerRef } from "../components/ui/TimerPickerCard";
import TemperaturePickerCard from "../components/ui/TemperaturePickerCard";
import type { TemperaturePickerRef } from "../components/ui/TemperaturePickerCard";
import ControlCenter from "../components/ui/ControlCenter";

interface ThemeType {
	background: string;
	text?: string;
	[key: string]: any;
}

interface MainProps {
	theme: ThemeType;
	onLogout?: () => void;
}

interface ActiveSessionType {
	title: string;
	initialSeconds: number;
	secondsLeft: number;
	isHrMin: boolean;
}

const KEYBOARD_CONFIG = {
	scrollY: 80,
	offsetIos: 40,
	offsetAndroid: 20,
};

const QUICK_ACTIONS = [
	{ id: "1", title: "Quick Dry", time: "00:10", subtitle: "min : sec 50°C" },
	{ id: "2", title: "Body Towel", time: "02:30", subtitle: "hr : min 65°C" },
	{
		id: "3",
		title: "Cotton Shirt",
		time: "05:00",
		subtitle: "min : sec 55°C",
	},
];

const INITIAL_DEVICE_STATUS = {
	water: 75 as 0 | 25 | 50 | 75 | 100 | null,
	door: "locked" as "locked" | "unlocked" | "inactive",
	uvActive: true,
	wifiLevel: 3 as 1 | 2 | 3 | 4,
	connectionState: "connected" as "connecting" | "connected" | "offline",
};

const parseTimeToSeconds = (timeStr: string, isHrMin: boolean): number => {
	const [parts1, parts2] = timeStr.split(":").map(Number);
	if (isHrMin) return parts1 * 3600 + parts2 * 60;
	return parts1 * 60 + parts2;
};

const formatSecondsToDisplay = (
	totalSeconds: number,
	isHrMin: boolean,
): string => {
	if (isHrMin) {
		const totalMinutes = Math.ceil(totalSeconds / 60);
		const hrs = Math.floor(totalMinutes / 60);
		const mins = totalMinutes % 60;
		return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
	}
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const MainScreen: React.FC<MainProps> = ({ theme, onLogout }) => {
	const [activeTab, setActiveTab] = useState<
		"dashboard" | "timer" | "settings"
	>("dashboard");
	const [activeActionId, setActiveActionId] = useState<string | null>(null);
	const [activeSession, setActiveSession] =
		useState<ActiveSessionType | null>(null);
	const [isPaused, setIsPaused] = useState<boolean>(false);

	const [displaySession, setDisplaySession] =
		useState<ActiveSessionType | null>(null);

	const scrollViewRef = useRef<ScrollView>(null);
	const timerPickerRef = useRef<TimerPickerRef>(null);
	const temperaturePickerRef = useRef<TemperaturePickerRef>(null);

	const isStacked = !!activeSession;

	const stackAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(stackAnim, {
			toValue: isStacked ? 1 : 0,
			duration: 380,
			useNativeDriver: false,
		}).start();
	}, [isStacked, stackAnim]);

	useEffect(() => {
		if (activeSession) {
			setDisplaySession(activeSession);
		} else {
			const timeout = setTimeout(() => {
				setDisplaySession(null);
			}, 380);
			return () => clearTimeout(timeout);
		}
	}, [activeSession]);

	useEffect(() => {
		const showEvent =
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent =
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
			if (activeTab === "timer") {
				setTimeout(() => {
					scrollViewRef.current?.scrollTo({
						y: KEYBOARD_CONFIG.scrollY,
						animated: true,
					});
				}, 60);
			}
		});

		const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
			scrollViewRef.current?.scrollTo({ y: 0, animated: true });
		});

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, [activeTab]);

	useEffect(() => {
		if (!activeSession || isPaused) return;

		const timer = setTimeout(() => {
			if (activeSession.secondsLeft <= 1) {
				console.log(`[Timer] "${activeSession.title}" completed!`);
				setActiveSession(null);
			} else {
				const nextSeconds = activeSession.secondsLeft - 1;
				setActiveSession((prev) =>
					prev ? { ...prev, secondsLeft: nextSeconds } : null,
				);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [activeSession?.secondsLeft, isPaused]);

	const titlebarMode = useMemo(() => {
		return activeTab === "timer" ? "setup" : activeTab;
	}, [activeTab]);

	const handlePauseToggle = () => {
		setIsPaused((prev) => !prev);
	};

	const handleCustomTimerStart = useCallback(() => {
		const timerValues = timerPickerRef.current?.getValues();
		const temperature = temperaturePickerRef.current?.getValue();

		if (!timerValues) return;

		const { leftVal, rightVal, isMinSec } = timerValues;
		const timeStr = `${leftVal || "00"}:${rightVal || "00"}`;
		const isHrMin = !isMinSec;
		const totalSeconds = parseTimeToSeconds(timeStr, isHrMin);

		if (totalSeconds <= 0) return;

		setIsPaused(false);
		setActiveSession({
			title: "Custom Timer",
			initialSeconds: totalSeconds,
			secondsLeft: totalSeconds,
			isHrMin,
		});

		setActiveTab("dashboard");
		console.log(
			`[Timer] Started custom timer: ${timeStr} at ${temperature || 50}°C`,
		);
	}, []);

	const handleResetTimer = useCallback(() => {
		timerPickerRef.current?.reset();
		temperaturePickerRef.current?.reset();
		console.log("[Timer] Reset to default values");
	}, []);

	const renderContent = () => {
		const timerOpacity = stackAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
		});

		const timerTranslateY = stackAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [-160, 0],
		});

		const timerHeight = stackAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 200],
		});

		const timerMarginBottom = stackAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 10],
		});

		const scrollView = (
			<ScrollView
				ref={scrollViewRef}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				{activeTab === "dashboard" && (
					<View style={styles.page}>
						<View style={styles.monitorContainer}>
							<SystemMonitor theme={theme} />
						</View>

						{displaySession && (
							<Animated.View
                style={{
                  width: "100%",
                  opacity: timerOpacity,
                  height: timerHeight,
                  marginBottom: timerMarginBottom,
                  // REMOVED: overflow: "hidden", paddingHorizontal, and marginHorizontal
                  zIndex: 1, 
                  transform: [
                    { translateY: timerTranslateY },
                  ],
                }}
              >
								<TimerCard
									theme={theme}
									time={formatSecondsToDisplay(
										displaySession.secondsLeft,
										displaySession.isHrMin,
									)}
									isHrMin={displaySession.isHrMin}
									progress={
										(displaySession.initialSeconds -
											displaySession.secondsLeft) /
										displaySession.initialSeconds
									}
									percentage={Math.round(
										((displaySession.initialSeconds -
											displaySession.secondsLeft) /
											displaySession.initialSeconds) *
											100,
									)}
									isPaused={isPaused}
									onPauseToggle={handlePauseToggle}
									onCancel={() => {
										console.log(
											"[Timer Engine] Cycle cleared.",
										);
										setActiveSession(null);
										setIsPaused(false);
									}}
								/>
							</Animated.View>
						)}

						<View style={styles.quickActionsSection}>
							<Text
								style={[
									styles.sectionHeader,
									{ color: theme.text || "#2E2E2E" },
								]}
							>
								Quick Actions
							</Text>

							{QUICK_ACTIONS.map((action, index) => {
								let cardState: QuickActionState = "default";
								if (isStacked) {
									cardState = "disabled";
								} else if (activeActionId === action.id) {
									cardState = "power_enabled";
								}

								const animatedMarginTop = stackAnim.interpolate(
									{
										inputRange: [0, 1],
										outputRange: [0, index === 0 ? 0 : -86],
									},
								);

								const animatedMarginBottom =
									stackAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [10, 0],
									});

								return (
									<Animated.View
										key={action.id}
										style={{
											marginTop: animatedMarginTop,
											marginBottom: animatedMarginBottom,
											zIndex:
												QUICK_ACTIONS.length - index,
										}}
									>
										<QuickActionCard
											theme={theme}
											title={action.title}
											time={action.time}
											subtitle={action.subtitle}
											state={cardState}
											onCardPress={() =>
												setActiveActionId((prev) =>
													prev === action.id
														? null
														: action.id,
												)
											}
											onPowerPress={() => {
												const isHrMinFormat =
													action.subtitle.includes(
														"hr : min",
													);
												const totalSeconds =
													parseTimeToSeconds(
														action.time,
														isHrMinFormat,
													);

												setIsPaused(false);
												setActiveSession({
													title: action.title,
													initialSeconds:
														totalSeconds,
													secondsLeft: totalSeconds,
													isHrMin: isHrMinFormat,
												});
											}}
										/>
									</Animated.View>
								);
							})}
						</View>
					</View>
				)}

				{activeTab === "timer" && (
					<View style={styles.timerPageContainer}>
						<TimerPickerCard ref={timerPickerRef} theme={theme} />
						<TemperaturePickerCard
							ref={temperaturePickerRef}
							theme={theme}
						/>
					</View>
				)}
			</ScrollView>
		);

		if (activeTab === "timer") {
			return (
				<KeyboardAvoidingView
					style={styles.flex}
					behavior="padding"
					keyboardVerticalOffset={
						Platform.OS === "ios"
							? KEYBOARD_CONFIG.offsetIos
							: KEYBOARD_CONFIG.offsetAndroid
					}
				>
					{scrollView}
				</KeyboardAvoidingView>
			);
		}

		return <View style={styles.flex}>{scrollView}</View>;
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={styles.headerContainer}>
				<AeraStatusBar theme={theme} status={INITIAL_DEVICE_STATUS} />
				<AeraTitlebar
					mode={titlebarMode}
					theme={theme}
					status={INITIAL_DEVICE_STATUS.connectionState}
					onPresetPress={() => console.log("Preset Menu Pressed")}
				/>
			</View>

			{renderContent()}

			<View style={styles.footer}>
				{activeTab === "timer" && (
					<View style={styles.controlCenterContainer}>
						<ControlCenter
							theme={theme}
							onPowerPress={handleCustomTimerStart}
							onResetPress={handleResetTimer}
							onBookmarkPress={(isBookmarked) => {
								console.log(
									`Bookmark ${isBookmarked ? "saved" : "removed"}`,
								);
							}}
						/>
					</View>
				)}
				<NavigationBar
					theme={theme}
					activeTab={activeTab}
					onTabChange={(tab: any) => setActiveTab(tab)}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	flex: { flex: 1 },
	headerContainer: { zIndex: 10 },
	scrollContent: {
		paddingHorizontal: 10,
		paddingTop: 10,
		paddingBottom: 220,
	},
	page: { width: "100%", alignItems: "center" },
	timerPageContainer: {
		width: "100%",
		alignItems: "center",
		gap: 10,
	},
	monitorContainer: {
		width: "100%",
		zIndex: 5,
		elevation: 5,
		marginBottom: 10,
	},
	quickActionsSection: { width: "100%", marginTop: 10 },
	sectionHeader: {
		fontFamily: "aera_heavy",
		fontSize: 22,
		alignSelf: "flex-start",
		paddingLeft: 4,
		marginBottom: 10,
	},
	footer: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		zIndex: 20,
		elevation: 20,
		flexDirection: "column",
		justifyContent: "flex-end",
	},
	controlCenterContainer: {
		width: "100%",
		marginBottom: 0,
		paddingBottom: 0,
	},
});

export default MainScreen;
