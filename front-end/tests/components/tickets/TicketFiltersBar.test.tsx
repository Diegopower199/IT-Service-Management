import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TicketFiltersBar from "@/app/modules/tickets/components/content/TicketFiltersBar";

vi.mock("next-intl", () => {
  const labels: Record<string, string> = {
    title: "Filters",
    searchByTitle: "Search by title",
    status: "Status",
    priority: "Priority",
    category: "Category",
    allStatuses: "All statuses",
    allPriorities: "All priorities",
    allCategories: "All categories",
    clear: "Clear",
    applyFilters: "Apply Filters",
  };

  const translate = Object.assign((key: string) => labels[key] ?? key, {
    has: () => false,
  });

  return { useTranslations: () => translate };
});

describe("TicketFiltersBar", () => {
  const renderBar = (
    filters: { title?: string | null; status?: string | null } = {},
  ) => {
    const onApply = vi.fn();
    const onClear = vi.fn();

    render(
      <TicketFiltersBar
        filters={filters}
        statusOptions={["OPEN", "RESOLVED"]}
        priorityOptions={["LOW", "HIGH"]}
        categoryOptions={["Hardware"]}
        onApply={onApply}
        onClear={onClear}
      />,
    );

    return { onApply, onClear };
  };

  it("renders the filter controls", () => {
    renderBar();

    expect(
      screen.getByRole("textbox", { name: "Search by title" }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole("combobox")).toHaveLength(3);

    expect(
      screen.getByRole("button", { name: "Apply Filters" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });

  it("applies a title filter only after clicking Apply Filters", async () => {
    const user = userEvent.setup();
    const { onApply } = renderBar();

    await user.type(
      screen.getByRole("textbox", { name: "Search by title" }),
      "Printer",
    );

    expect(onApply).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(onApply).toHaveBeenCalledWith({
      title: "Printer",
    });
  });

  it("includes selected status and priority when applying filters", async () => {
    const user = userEvent.setup();
    const { onApply } = renderBar();

    const [statusSelect, prioritySelect] = screen.getAllByRole("combobox");

    await user.click(statusSelect);
    await user.click(await screen.findByRole("option", { name: "OPEN" }));

    await user.click(prioritySelect);
    await user.click(await screen.findByRole("option", { name: "HIGH" }));

    await user.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(onApply).toHaveBeenCalledWith({
      status: "OPEN",
      priority: "HIGH",
    });
  });

  it("clears local inputs and calls onClear", async () => {
    const user = userEvent.setup();

    const { onClear } = renderBar({
      title: "Printer",
      status: "OPEN",
    });

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onClear).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("textbox", { name: "Search by title" }),
    ).toHaveValue("");

    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
  });
});
