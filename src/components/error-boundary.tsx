"use client";

import { Component, type ReactNode } from "react";
import { AppButton } from "@/components/ui/tailwind-primitives";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
};

type State = {
	hasError: boolean;
	error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		// Extend here: send to analytics, error reporting service, etc.
	}

	render() {
		if (this.state.hasError && this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
					<h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Something went wrong</h2>
					<p className="text-sm text-red-700 dark:text-red-200">{this.state.error.message}</p>
					<AppButton type="button" variant="danger" className="font-medium" onClick={() => this.setState({ hasError: false, error: null })}>
						Try again
					</AppButton>
				</div>
			);
		}
		return this.props.children;
	}
}
