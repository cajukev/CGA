<script context="module">
	export const load = async({fetch}) => {
		const res = await fetch("./api/hello-world")
		const data = await res;
		console.log(await data)
		return {
			props: {
				data
			}
		}
	}
</script>

<script>
  import ProductCard from '../components/productcard.svelte'
  import productList from '../products.json';
	let products = productList.productList.slice(0,3);
	let aisles = [
		{ name: 'Fruits', image: 'strawberries' },
		{ name: 'Vegetables', image: 'cucumber' },
		{ name: 'Meat', image: 'steak' },
		{ name: 'Dairy', image: 'milk' },
	];

	export let data
</script>

<div class="home-wrapper">
	{data}
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
					
					<div class="img-container">
						<picture>
							<source
								srcset="/{aisle.image}-120.webp, /{aisle.image}-400.webp 2x"
								media="(max-width:500px)"
								type="image/webp"
							/>
							<source
								srcset="/{aisle.image}-120.jpg, /{aisle.image}-400.jpg 2x"
								media="(max-width:500px)"
								type="image/jpeg"
							/>
							<source
								srcset="/{aisle.image}-400.webp, /{aisle.image}-800.webp 2x"
								media="(max-width:500px)"
								type="image/webp"
							/>
							<source
								srcset="/{aisle.image}-400.jpg, /{aisle.image}-800.jpg 2x"
								media="(max-width:768px)"
								type="image/jpeg"
							/>
							<source srcset="/{aisle.image}-400.webp" media="(max-width:1280px)" type="image/webp" />
							<source srcset="/{aisle.image}-400.jpg" media="(max-width:1280px)" type="image/jpeg" />
							<source srcset="/{aisle.image}-600.webp" media="(max-width:1920px)" type="image/webp" />
							<source srcset="/{aisle.image}-600.jpg" media="(max-width:1920px)" type="image/jpeg" />
							<source srcset="/{aisle.image}-800.webp" type="image/webp" />
							<source srcset="/{aisle.image}-800.jpg" type="image/jpeg" />
							<img src="/{aisle.image}-400.jpg" alt="hi:)" class="bg-image"/>
						</picture>
					</div>

					<h2>{aisle.name}</h2>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	
</style>
