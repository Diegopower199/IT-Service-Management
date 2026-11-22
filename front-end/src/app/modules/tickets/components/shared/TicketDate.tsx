import { useLocale } from "next-intl";

export default function TicketDate({ value }: { value: string }) {
  const locale = useLocale();
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return <time dateTime={value}>{formatter.format(date)}</time>;
}
