import clsx from 'clsx';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  intent?: 'neutral' | 'positive' | 'warning' | 'danger';
};

function Badge({ intent = 'neutral', className, ...props }: Props) {
  const map = {
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    positive: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium',
        map[intent],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;


