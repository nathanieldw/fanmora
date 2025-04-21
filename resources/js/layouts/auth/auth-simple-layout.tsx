import Logo from '@/components/ui/Logo';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
	name?: string;
	title?: string;
	description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
	return (
		<div className="flex min-h-svh items-center justify-center bg-gray-100 p-6 dark:bg-gray-900 md:p-10">
			<div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
				<div className="flex flex-col items-center gap-6">
					<Link href={route('home')} className="mb-2 flex flex-col items-center gap-2 font-medium">
						<Logo variant="default" />
						<span className="sr-only">{title}</span>
					</Link>

					<div className="space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
							{title}
						</h1>
						<p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
					</div>

					<div className="w-full">
                        {children}
                    </div>

				</div>
			</div>
		</div>
	);
}
