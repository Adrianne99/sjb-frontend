// Buttons. Variants: primary | secondary | ghost | danger | gold.
//
//   <Button onClick={save} loading={saving}>Save</Button>
//   <ButtonLink to="/login" variant="secondary">Login</ButtonLink>
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-styles";
import { Spinner } from "./Spinner";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, fullWidth, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

type ButtonLinkProps = LinkProps & CommonProps;

export function ButtonLink({ variant = "primary", size = "md", fullWidth, leftIcon, rightIcon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, fullWidth, className)} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: describes the button for screen readers. */
  label: string;
  variant?: "ghost" | "secondary" | "danger";
  size?: "sm" | "md";
}

/** Square button that shows only an icon. */
export function IconButton({ label, variant = "ghost", size = "md", className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={buttonClasses(variant, size, false, `${size === "sm" ? "w-9" : "w-10"} px-0 ${className ?? ""}`)}
      {...rest}
    >
      {children}
    </button>
  );
}
