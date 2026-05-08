import { describe, it, expect } from "vitest";
import { isDeadlinePassed } from "@/lib/utils";

describe("isDeadlinePassed", () => {
  it("returns true when the deadline is in the past", () => {
    expect(isDeadlinePassed("2020-01-01T00:00:00")).toBe(true);
  });

  it("returns false when the deadline is in the future", () => {
    expect(isDeadlinePassed("2099-01-01T00:00:00")).toBe(false);
  });
});

describe("RSVP validation rules", () => {
  it("requires at least one of email or phone", () => {
    const hasContact = (email: string, phone: string) =>
      !!(email.trim() || phone.trim());

    expect(hasContact("test@email.com", "")).toBe(true);
    expect(hasContact("", "555-1234")).toBe(true);
    expect(hasContact("", "")).toBe(false);
    expect(hasContact("test@email.com", "555-1234")).toBe(true);
  });

  it("correctly calculates headcount from adults and kids", () => {
    const headcount = (adults: number, kids: number) => adults + kids;
    expect(headcount(2, 3)).toBe(5);
    expect(headcount(1, 0)).toBe(1);
    expect(headcount(0, 0)).toBe(0);
  });

  it("forces adults to 0 when status is declined", () => {
    const adults = (status: string, inputAdults: number) =>
      status === "attending" ? Math.max(1, inputAdults) : 0;

    expect(adults("attending", 2)).toBe(2);
    expect(adults("declined", 2)).toBe(0);
    expect(adults("attending", 0)).toBe(1); // min 1
  });
});
