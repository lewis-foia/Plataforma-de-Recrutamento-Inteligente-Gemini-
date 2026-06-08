interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  centered?: boolean;
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export default function Spinner({ size = 'md', text, centered = false, className = '' }: SpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizes[size]} rounded-full animate-spin border-t-blue-600 border-gray-200`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
  if (centered) return <div className={`flex justify-center items-center py-8 ${className}`}>{spinner}</div>;
  return spinner;
}