import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildListingMapUrl, CATEGORY_IMAGES, parsePremiumText, seedListings } from "@/lib/data";
import { setState } from "@/lib/store";
import { Route } from "@/routes/dashboard";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("builds a working Google Maps link from a real listing address", () => {
    const url = buildListingMapUrl("Kicukiro, Kanombe, Busanza, Rukore");

    expect(url).toContain("google.com/maps");
    expect(url).toContain("q=Kicukiro%2C%20Kanombe%2C%20Busanza%2C%20Rukore");
    expect(url).toContain("output=embed");
  });

  it("parses premium detail lines into usable listing fields", () => {
    const fields = parsePremiumText("Exact location: Kicukiro, Kanombe, Busanza\nUPI: 1/03/05/01/5107\nOwner phone: 0788405145 / 0735053274");

    expect(fields).toEqual([
      { label: "Exact location", value: "Kicukiro, Kanombe, Busanza" },
      { label: "UPI", value: "1/03/05/01/5107" },
      { label: "Owner phone", value: "0788405145 / 0735053274" },
    ]);
  });

  it("uses category-appropriate imagery for cars and electronics listings", () => {
    const electronics = seedListings.filter((listing) => listing.category === "electronics");
    const cars = seedListings.filter((listing) => listing.category === "car");

    expect(electronics.every((listing) => listing.img !== CATEGORY_IMAGES.car)).toBe(true);
    expect(cars.every((listing) => listing.img !== CATEGORY_IMAGES.electronics)).toBe(true);
    expect(electronics.some((listing) => listing.img.includes("photo-"))).toBe(true);
    expect(cars.some((listing) => listing.img.includes("photo-"))).toBe(true);
  });

  it("uses varied, title-matched images instead of repeating the same generic asset", () => {
    const cars = seedListings.filter((listing) => listing.category === "car");
    const electronics = seedListings.filter((listing) => listing.category === "electronics");
    const land = seedListings.filter((listing) => listing.category === "land");

    expect(new Set(cars.map((listing) => listing.img)).size).toBeGreaterThan(1);
    expect(new Set(electronics.map((listing) => listing.img)).size).toBeGreaterThan(1);
    expect(new Set(land.map((listing) => listing.img)).size).toBeGreaterThan(1);
    expect(cars.some((listing) => /toyota|bmw|audi|mercedes|prado/i.test(listing.title))).toBe(true);
  });

  it("renders the dashboard consistently before and after a user logs in", () => {
    act(() => {
      setState(() => ({ currentUserId: null }));
    });
    const { rerender } = render(<Route.options.component />);

    expect(screen.getByText(/sign in to view your dashboard/i)).toBeInTheDocument();

    act(() => {
      setState(() => ({ currentUserId: "u1" }));
      rerender(<Route.options.component />);
    });

    expect(screen.getByRole("heading", { name: /super admin control center/i })).toBeInTheDocument();
    expect(screen.getByText(/amani alain/i)).toBeInTheDocument();
    expect(screen.getAllByText(/user management/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/system health/i).length).toBeGreaterThan(0);
  });

  it("keeps the super admin sidebar lean and exposes the management controls", () => {
    act(() => {
      setState(() => ({ currentUserId: "u1" }));
    });

    render(<Route.options.component />);

    expect(screen.getAllByRole("button", { name: /dashboard/i })).toHaveLength(1);
    expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /public site/i })).toBeInTheDocument();
  });

});
