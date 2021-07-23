<script>
  import ProductCard from '../components/productcard.svelte'
  
	let products = [
		{ name: 'White Bread', price: 7.99, rebate: 5.0, image: 'bread1.jpg' },
		{ name: 'White Bread', price: 7.99, rebate: 0.0, image: 'bread1.jpg' },
		{ name: 'White Bread', price: 7.99, rebate: 5.0, image: 'bread1.jpg' }
	];
	let aisles = [
		{ name: 'fruits', image: 'fruits.jpg' },
		{ name: 'fruits', image: 'fruits.jpg' },
		{ name: 'fruits', image: 'fruits.jpg' },
		{ name: 'fruits', image: 'fruits.jpg' },
		{ name: 'fruits', image: 'fruits.jpg' },
		{ name: 'fruits', image: 'fruits.jpg' }
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
				<a href={'/' + aisle.name}>
					<img src={aisle.image} alt={aisle.name} />
					<h2>{aisle.name}</h2>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	
</style>
