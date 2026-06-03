import { ButtonHTMLAttributes, forwardRef } from 'react'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary'|'secondary'|'danger'|'outline'; size?: 'sm'|'md'|'lg' }
const variants = { primary: 'bg-primary-600 text-white hover:bg-primary-700', secondary: 'bg-gray-600 text-white hover:bg-gray-700', danger: 'bg-red-600 text-white hover:bg-red-700', outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50' }
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' }
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant='primary', size='md', className='', children, ...props }, ref) => (
  <button ref={ref} className={`rounded-lg font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
))
Button.displayName = 'Button'
export default Button
