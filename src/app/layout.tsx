import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { AppHeader } from "@/components/app-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
	title: "GreatFrontEnd Portfolio",
	description: "Interview solutions for GFE75 and Blind75 in React + TypeScript",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="bg-background">
			<head />
			<body className="flex min-h-screen flex-col bg-background antialiased">
				<AppProviders>
					<div className="flex min-h-screen flex-1 flex-col">
						<AppHeader />
						<div className="flex flex-1 flex-col">
							<ErrorBoundary>
								<main className="flex min-h-full flex-1 flex-col overflow-x-hidden bg-background px-10 py-6 sm:px-14 md:px-20 lg:px-24 xl:px-32">
									{children}
								</main>
							</ErrorBoundary>
						</div>
					</div>
				</AppProviders>
				<AnalyticsProvider />
			</body>
		</html>
	);
}
