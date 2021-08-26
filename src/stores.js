import { writable } from 'svelte-local-storage-store';

export const cart = writable('cart', []);

export const userCredentials = writable('userCredentials',{
  secret : '',
  type : '',
  email: ''
})