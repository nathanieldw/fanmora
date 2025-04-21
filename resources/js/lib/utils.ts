import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a price value to a currency string
 * @param price The price to format
 * @param currency The currency code (default: EUR)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
    // Handle free or zero price
    if (price === 0) {
        return 'Free';
    }
    
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(price);
}
