import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import TicketClassificationChip from "@/components/ui/TicketClassificationChip";
import { getHistoryValueLabel } from "@/utils/ticketUiUtils";

import commonEn from "../../../messages/en/common.json";
import commonEs from "../../../messages/es/common.json";

const classifications = [
  { kind: "status", name: "CLOSED", en: "Closed", es: "Cerrado" },
  { kind: "status", name: "BLOCKED", en: "Blocked", es: "Bloqueado" },
  { kind: "priority", name: "VERY_LOW", en: "Very low", es: "Muy baja" },
  { kind: "priority", name: "URGENT", en: "Urgent", es: "Urgente" },
] as const;

describe("TicketClassificationChip", () => {
  it.each(["en", "es"] as const)("shows translated labels and distinct colors in %s", (locale) => {
    render(
      <NextIntlClientProvider locale={locale} timeZone="UTC" messages={{ Common: locale === "en" ? commonEn : commonEs }}>
        {classifications.map(({ kind, name }) => <TicketClassificationChip key={name} kind={kind} name={name} />)}
      </NextIntlClientProvider>,
    );

    const backgrounds = classifications.map((classification) => {
      const chip = screen.getByText(classification[locale]).closest<HTMLElement>(".MuiChip-root");
      expect(chip?.style.backgroundColor).toBeTruthy();
      return chip?.style.backgroundColor;
    });
    expect(new Set(backgrounds).size).toBe(classifications.length);
  });

  it("formats an untranslated name as sentence case", () => {
    render(
      <NextIntlClientProvider locale="en" timeZone="UTC" messages={{ Common: commonEn }}>
        <TicketClassificationChip kind="status" name="CUSTOMER-UPDATE__REQUIRED" />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Customer update required")).toBeInTheDocument();
  });

  it.each([
    ["WAITING", "Bloqueado"],
    ["PENDING_CUSTOMER", "Bloqueado"],
    ["PENDING_VENDOR", "Bloqueado"],
    ["CANCELLED", "Cerrado"],
  ])("shows the current status label for legacy history value %s", (legacy, expected) => {
    const messages: Record<string, string> = commonEs.Statuses;
    const translate = Object.assign((key: string) => messages[key], {
      has: (key: string) => Object.hasOwn(messages, key),
    });

    expect(getHistoryValueLabel("STATUS_CHANGED", legacy, translate, translate)).toBe(expected);
    expect(getHistoryValueLabel("TITLE_CHANGED", legacy, translate, translate)).toBe(legacy);
  });
});
