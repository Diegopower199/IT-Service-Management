import type { InputHTMLAttributes } from "react";

/**
 * Props accepted by the reusable Input component.
 *
 * It extends the native HTML input attributes, so this component
 * can receive properties such as:
 *
 * - type
 * - id
 * - name
 * - value
 * - placeholder
 * - disabled
 * - required
 * - onChange
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Reusable input component.
 *
 * It behaves like a normal HTML <input> while allowing us to
 * centralize its appearance and behaviour across the application.
 */
export default function Input(props: InputProps) {
  return <input {...props} />;
}
