import React from "react";

export default function Button({
  children,
  type = "primary", // Internal style key
  variant,          // External alias for type
  htmlType = "button",
  onClick,
  disabled = false,
  className = "",
  icon,
  ...props
}) {
  const chosenVariant = variant || type;

  const baseClasses = `
    inline-flex items-center justify-center gap-2 cursor-pointer
    px-7 py-3 rounded-xl
    text-sm font-medium tracking-wide
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const styles = {
    primary: `
      bg-[var(--color-primary)]
      text-white
      hover:opacity-90
      shadow-md
      hover:shadow-lg hover:-translate-y-0.5
      active:translate-y-0 active:shadow-md
      focus:ring-[var(--color-primary)]
    `,

    secondary: `
      bg-[var(--bg-card)]
      text-white
      border border-white/10
      hover:bg-white/5
      hover:-translate-y-0.5 hover:shadow-md
      active:translate-y-0
      focus:ring-[var(--color-primary)]
    `,

    outline: `
      bg-transparent
      text-[var(--color-primary)]
      border border-[var(--color-primary)]
      hover:bg-[var(--color-primary)]
      hover:text-white
      focus:ring-[var(--color-primary)]
    `,
  };

  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${styles[chosenVariant] || styles.primary} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
}
