import { writable } from 'svelte-local-storage-store';

export const cart = writable('cart', [
	{
		name: 'Strawberries',
		description: 'Organic strawberries, 0.5kg',
		origin: 'Ontario',
		price: 4.49,
		rebate: 0,
		quantity: 100,
		image: 'strawberries.jpg',
		aisle: 'Fruits',
		amount: 1
	},

	{
		name: 'Blueberries',
		description: 'Organic blueberries, 0.5kg',
		origin: 'Ontario',
		price: 4.49,
		rebate: 1.0,
		quantity: 100,
		image: 'blueberries.jpg',
		aisle: 'Fruits',
		amount: 1
	}
]);
