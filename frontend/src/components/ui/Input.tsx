import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, rightElement, className = '', ...props }, ref) => {
    const hasError = !!error;
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
          <input
            ref={ref}
            className={`w-full rounded-xl bg-gray-50 border px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${hasError ? 'border-red-500 focus:ring-red-500/40' : 'border-gray-300 focus:ring-blue-500/40 focus:border-blue-500'} ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
        </div>
        {hasError && <p className="text-red-600 text-xs mt-1">{error}</p>}
        {!hasError && helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;