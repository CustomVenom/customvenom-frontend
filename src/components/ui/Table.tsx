import clsx from 'clsx'

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
	return <table className={clsx('w-full border-separate border-spacing-0 text-sm', className)} {...props}/>
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <thead {...props}/>
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
	return <th className={clsx('sticky top-0 z-10 bg-white dark:bg-[rgb(var(--bg))] text-left text-gray-500 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-gray-700 px-3 py-2', className)} {...props}/>
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody {...props}/>
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
	return <tr className={clsx('hover:bg-gray-50 dark:hover:bg-gray-800', className)} {...props}/>
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
	return <td className={clsx('border-b border-gray-100 dark:border-gray-800 px-3 py-2 align-middle', className)} {...props}/>
}

