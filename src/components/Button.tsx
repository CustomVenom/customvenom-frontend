import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({ variant = 'primary', size = 'md', className, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }[size];
  
  const variants = {
    primary: 'bg-[var(--cv-primary)] text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-[var(--cv-accent)] text-[#0C2B1B] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'border border-[var(--cv-primary)] dark:border-[var(--cv-accent)] text-[var(--cv-primary)] dark:text-[var(--cv-accent)] bg-transparent hover:bg-[color:rgba(14_124_69_/_0.06)] dark:hover:bg-[color:rgba(126_217_163_/_0.06)] disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-[#DC2626] text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed',
  }[variant];
  
  return <button className={clsx(base, sizes, variants, className)} {...rest} />;
}

