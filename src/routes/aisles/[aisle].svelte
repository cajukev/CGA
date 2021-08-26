<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const aisle = page.path.split('/')[2];
		const res = await fetch('/api/productlist')
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
			props: { productList: productList, aisle: aisle}
		};
	}
</script>

<script>

	export let aisle, productList;
	let aisleProducts = [];
	productList.forEach((product) => {
    
		if (aisle.slice(1) === product.aisle.slice(1)) {
			aisleProducts.push(product);
		}
	});
  
	import Productcard from '../../components/productcard.svelte';
</script>

<div class="aisle-wrapper">
	<div class="aisle">
		<h1>{aisle.charAt(0).toUpperCase() + aisle.slice(1)} Aisle</h1>
		<div class="products">
      
			{#each aisleProducts as product}
				<Productcard {product} />
			{/each}
		</div>
	</div>
</div>

<style>
</style>
