<script>
  import ProductCard from '../components/productcard.svelte'
  import productList from '../products.json';
	let products = productList.productList.slice(0,3);
	let aisles = [
		{ name: 'Fruits', image: 'strawberries.jpg' },
		{ name: 'Vegetables', image: 'cucumber.jpg' },
		{ name: 'Meat', image: 'steak.jpg' },
		{ name: 'Dairy', image: 'milk.jpg' },
	];
</script>

<div class="home-wrapper">
	<div class="banner">
		<h1>Today’s Featured Products</h1>
		<div class="products">
			{#each products as product}
				<ProductCard product={product} />
			{/each}
		</div>
	</div>
	<div class="aisles-wrapper">
    <h1>Aisles</h1>
		<div class="aisles">
			{#each aisles as aisle}
				<a href={'/aisles/' + aisle.name}>
					<img src={aisle.image} alt={aisle.name} />
					<h2>{aisle.name}</h2>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	
</style>
