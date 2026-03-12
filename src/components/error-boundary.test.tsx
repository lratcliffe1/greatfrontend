import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/error-boundary";

function ThrowError(): never {
	throw new Error("Test error");
}

describe("ErrorBoundary", () => {
	it("renders children when there is no error", () => {
		render(
			<ErrorBoundary>
				<div data-testid="child">Child content</div>
			</ErrorBoundary>,
		);
		expect(screen.getByTestId("child")).toHaveTextContent("Child content");
	});

	it("renders error UI when child throws", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	it("renders custom fallback when provided", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error UI</div>}>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(screen.getByTestId("custom-fallback")).toHaveTextContent("Custom error UI");
		expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	it("calls componentDidCatch when error occurs", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(consoleSpy).toHaveBeenCalledWith("ErrorBoundary caught an error:", expect.any(Error), expect.any(Object));

		consoleSpy.mockRestore();
	});
});
