import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 ${
                    disabled ? 'bg-red-600' : 'bg-red-600 hover:bg-red-700'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
