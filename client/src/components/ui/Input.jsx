import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    onWheel,
    placeholder,
    required = false,
    variant = "default",
    className = "",
    labelClassName = "",
    icon: Icon,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const base =
        "w-full px-4 py-3 outline-none transition-all duration-200 text-[var(--color-black)] bg-white shadow-sm hover:shadow-md focus:shadow-md";

    const variants = {
        default: `
            border border-gray-100
            focus:border-[var(--color-primary)]/40
            text-[var(--text-secondary)] rounded-xl
        `,
        formInput: `
            border border-gray-100
            focus:border-[var(--color-primary)]/40
            text-[var(--text-secondary)] rounded-xl
        `
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className={`block text-sm font-semibold  ${labelClassName || "text-[var(--text-secondary)]"}`}>
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors duration-300">
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                )}
                
                <input
                    type={isPassword && showPassword ? "text" : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onWheel={(e) => {
                        if (type === "number") {
                            e.currentTarget.blur();
                        }
                        if (onWheel) onWheel(e);
                    }}
                    placeholder={placeholder}
                    required={required}
                    className={`
                        ${base}
                        ${variants[variant]}
                        ${Icon ? "pl-12" : "px-5"}
                        ${isPassword ? "pr-12" : "pr-5"}
                        ${type === "number" ? "no-spinner" : ""}
                        h-14
                        font-bold
                        ${className}
                    `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="
                                absolute right-3 top-1/2 -translate-y-1/2
                                text-gray-500 hover:text-[var(--color-primary)]
                                transition
                                "
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
}
