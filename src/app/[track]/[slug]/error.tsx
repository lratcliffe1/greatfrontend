"use client";

import Link from "next/link";
import { AppButton } from "@/components/ui/tailwind-primitives";

export default function QuestionError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6">
			<h2 className="text-lg font-semibold text-red-800">
				Something went wrong
			</h2>
			<p className="text-sm text-red-700">{error.message}</p>
			<div className="flex gap-3">
				<AppButton
					type="button"
					variant="danger"
					className="font-medium"
					onClick={reset}
				>
					Try again
				</AppButton>
				<Link
					href="/"
					className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
				>
					Go home
				</Link>
			</div>
		</div>
	);
}
