"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

import { makeStore, type AppStore } from "@/lib/store";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const muiPalette = useMemo(
		() =>
			prefersDarkMode
				? {
						primary: "#2dd4bf",
						textPrimary: "#f1f5f9",
						textSecondary: "#cbd5e1",
						background: "#0a0a0a",
						paper: "#1e293b",
						divider: "#334155",
					}
				: {
						primary: "#0f766e",
						textPrimary: "#171717",
						textSecondary: "#64748b",
						background: "#ffffff",
						paper: "#f8fafc",
						divider: "#e2e8f0",
					},
		[prefersDarkMode],
	);

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? "dark" : "light",
					primary: {
						main: muiPalette.primary,
					},
					text: {
						primary: muiPalette.textPrimary,
						secondary: muiPalette.textSecondary,
					},
					background: {
						default: muiPalette.background,
						paper: muiPalette.paper,
					},
					divider: muiPalette.divider,
				},
				typography: {
					fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
				},
				components: {
					MuiFormControl: {
						styleOverrides: {
							root: {
								minWidth: 220,
								width: 220,
							},
						},
					},
					MuiOutlinedInput: {
						styleOverrides: {
							root: {
								backgroundColor: "var(--input-bg)",
							},
						},
					},
					MuiInputLabel: {
						styleOverrides: {
							root: {
								color: "var(--muted)",
							},
						},
					},
				},
			}),
		[muiPalette, prefersDarkMode],
	);

	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

type AppProvidersProps = {
	children: React.ReactNode;
	store?: AppStore;
};

export function AppProviders({ children, store }: AppProvidersProps) {
	const appStore = useMemo(() => store ?? makeStore(), [store]);

	return (
		<Provider store={appStore}>
			<ThemeWrapper>{children}</ThemeWrapper>
		</Provider>
	);
}
