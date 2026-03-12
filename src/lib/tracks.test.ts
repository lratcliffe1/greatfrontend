import { getTrackLabel, isTrack, TRACKS } from "@/lib/tracks";

describe("tracks", () => {
	describe("TRACKS", () => {
		it("includes gfe75 and blind75", () => {
			expect(TRACKS).toEqual(["gfe75", "blind75"]);
		});
	});

	describe("isTrack", () => {
		it("returns true for gfe75", () => {
			expect(isTrack("gfe75")).toBe(true);
		});

		it("returns true for blind75", () => {
			expect(isTrack("blind75")).toBe(true);
		});

		it("returns false for invalid values", () => {
			expect(isTrack("")).toBe(false);
			expect(isTrack("gfe76")).toBe(false);
			expect(isTrack("blind74")).toBe(false);
			expect(isTrack("other")).toBe(false);
		});
	});

	describe("getTrackLabel", () => {
		it("returns GFE 75 for gfe75", () => {
			expect(getTrackLabel("gfe75")).toBe("GFE 75");
		});

		it("returns Blind 75 for blind75", () => {
			expect(getTrackLabel("blind75")).toBe("Blind 75");
		});
	});
});
