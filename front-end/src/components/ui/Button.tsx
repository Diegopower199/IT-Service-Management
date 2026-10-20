import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Props accepted by the reusable Button component.
 *
 * It extends the native HTML button attributes, so this component
 * can receive properties such as:
 *
 * - type
 * - disabled
 * - onClick
 * - name
 * - value
 * - aria-label
 *
 * The children property represents the content displayed inside
 * the button.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Reusable button component.
 *
 * It behaves like a normal HTML <button>, but allows us to centralize
 * the appearance and behaviour of buttons across the application.
 */
export default function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
