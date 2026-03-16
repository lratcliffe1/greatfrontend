"use client";

import { SubmitEvent, useState } from "react";

const API_URL = "/api/contact-form";

export function ContactFormDemo() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const formData = new FormData(form);
		const payload = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			message: formData.get("message") as string,
		};

		setIsSubmitting(true);
		try {
			const res = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = (await res.json()) as { message?: string };
			if (res.ok) {
				alert(data.message ?? "Message sent successfully!");
				form.reset();
			} else {
				alert(data.message ?? "Something went wrong. Please try again.");
			}
		} catch {
			alert("Failed to send message. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="flex justify-center">
			<form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl">
				<div>
					<label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1">
						Name
					</label>
					<input
						id="contact-name"
						type="text"
						name="name"
						className="w-full rounded-md border border-card-border px-3 py-2 text-foreground bg-background"
					/>
				</div>
				<div>
					<label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1">
						Email
					</label>
					<input
						id="contact-email"
						type="email"
						name="email"
						className="w-full rounded-md border border-card-border px-3 py-2 text-foreground bg-background"
					/>
				</div>
				<div>
					<label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1">
						Message
					</label>
					<textarea
						id="contact-message"
						name="message"
						rows={5}
						className="w-full rounded-md border border-card-border px-3 py-2 text-foreground bg-background resize-y"
					/>
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? "Sending..." : "Send"}
				</button>
			</form>
		</div>
	);
}
