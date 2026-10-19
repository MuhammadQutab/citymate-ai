import type { CategoryId } from "../places/categories";

/** Settling-in plan: pure data, reusable by web and future mobile clients. */
export type ChecklistTask = { id: string; label: string; category?: CategoryId; custom?: boolean };

export const RESIDENT_SECTIONS: { id: string; title: string; blurb: string; categories: CategoryId[] }[] = [
  {
    id: "home",
    title: "Home setup",
    blurb: "Get the house working",
    categories: ["electrician", "plumber", "ac_repair", "hardware", "appliance_store", "furniture"],
  },
  {
    id: "daily",
    title: "Daily essentials",
    blurb: "Food, cash and medicine",
    categories: ["grocery", "pharmacy", "atm", "cash_carry", "hospital", "mosque"],
  },
  {
    id: "family",
    title: "Family & lifestyle",
    blurb: "Settle in and explore",
    categories: ["park", "playground", "market", "food", "cafe", "transport"],
  },
];

export const DEFAULT_TASKS: ChecklistTask[] = [
  { id: "grocery", label: "Find a grocery store near my new home", category: "grocery" },
  { id: "pharmacy", label: "Locate the nearest pharmacy", category: "pharmacy" },
  { id: "hospital", label: "Know where the closest hospital or clinic is", category: "hospital" },
  { id: "atm", label: "Find an ATM or bank branch", category: "atm" },
  { id: "electrician", label: "Find an electrician for fans and fittings", category: "electrician" },
  { id: "plumber", label: "Find a plumber (or a hardware shop for parts)", category: "plumber" },
  { id: "hardware", label: "Locate a hardware shop for basic tools", category: "hardware" },
  { id: "furniture", label: "Shop for household essentials", category: "furniture" },
  { id: "mosque", label: "Find the nearest mosque", category: "mosque" },
  { id: "park", label: "Find a family-friendly park", category: "park" },
  { id: "transport", label: "Learn the nearest bus station or taxi stand", category: "transport" },
];

/** Home-service categories open the Home Services page; the rest open the City Explorer map. */
export const SERVICE_PAGE_GROUPS = new Set(["home_services", "home_shopping"]);

export type ResidentProfile = {
  city: string;
  area: string;
  done: Record<string, boolean>;
  custom: ChecklistTask[];
  welcomed: boolean;
};

export const EMPTY_PROFILE: ResidentProfile = { city: "islamabad", area: "", done: {}, custom: [], welcomed: false };
