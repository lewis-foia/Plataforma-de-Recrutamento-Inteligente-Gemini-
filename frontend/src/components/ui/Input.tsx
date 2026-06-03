import { InputHTMLAttributes, forwardRef } from 'react'
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className='', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input ref={ref} className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input
