import type { LabelHTMLAttributes, ReactNode } from "react";

/**
 * Props accepted by the reusable Label component.
 *
 * It extends the native HTML label attributes, allowing properties
 * such as:
 *
 * - htmlFor
 * - id
 * - className
 *
 * The children property represents the text or content displayed
 * inside the label.
 */
interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

/**
 * Reusable label component.
 *
 * It behaves like a normal HTML <label> while allowing us to
 * centralize its appearance across the application.
 */
export default function Label({ children, ...props }: LabelProps) {
  return <label {...props}>{children}</label>;
}
