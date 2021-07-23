<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const aisle = page.path.split('/')[2];

		return {
			props: {
				aisle
			}
		};
	}
</script>

<script>

	export let aisle;
	import productList from '../../products.json';
	let aisleProducts = [];
	productList.productList.forEach((product) => {
    
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
