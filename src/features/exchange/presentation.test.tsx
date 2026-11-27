import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExchangePresentation, ThemeToggle } from "./presentation";

describe("Exchange presentation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("shows the introduction at launch but not again during the same tab session", () => {
    const first = render(<ExchangePresentation><ThemeToggle /></ExchangePresentation>);
    expect(screen.queryByRole("status")).not.toBeNull();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.queryByRole("status")).toBeNull();
    first.unmount();
    render(<ExchangePresentation><ThemeToggle /></ExchangePresentation>);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("switches between light and dark and retains the selected presentation preference", () => {
    const first = render(<ExchangePresentation><ThemeToggle /></ExchangePresentation>);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Passer au mode clair" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("dz-exchange-theme")).toBe("light");
    first.unmount();
    render(<ExchangePresentation><ThemeToggle /></ExchangePresentation>);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Passer au mode sombre" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("dz-exchange-theme")).toBe("dark");
  });
});