<script context="module">
	export const load = async ({ fetch }) => {
		const res = await fetch('/api/list')
			.then((response) => response.json())
			.then((json) => {
				return json;
			});
		const data = await res;
		let productList = [];
		data.data.forEach((product) => {
			productList.push(product.data);
		});
		return {
			context: { productList }
		};
	};
</script>

<script>
	import Header from '../components/header.svelte';
	import Footer from '../components/footer.svelte';
	import { onMount } from 'svelte';
</script>

<Header />

<slot />

<Footer />

<style lang="scss">
</style>
