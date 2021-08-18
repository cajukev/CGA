<script context="module">
	let productList;
	export async function load({ page, fetch, session, context }) {
		productList = context.productList;
		return true;
	}
</script>

<script>
	let aisles = [
		{ name: 'Fruits', image: 'strawberries', products: [] },
		{ name: 'Vegetables', image: 'cucumber', products: [] },
		{ name: 'Meat', image: 'steak', products: [] },
		{ name: 'Dairy', image: 'milk', products: [] }
	];
	productList.forEach((product) => {
		switch (product.aisle) {
			case 'Fruits':
				if (aisles[0].products.length != 3) {
					aisles[0].products.push(product);
				}

				break;
			case 'Vegetables':
				if (aisles[1].products.length != 3) {
					aisles[1].products.push(product);
				}
				break;
			case 'Meats':
				if (aisles[2].products.length != 3) {
					aisles[2].products.push(product);
				}
				break;
			case 'Dairy':
				if (aisles[3].products.length != 3) {
					aisles[3].products.push(product);
				}
				break;
		}
	});
</script>

<div class="aisles-wrapper">
	<h1>Aisles</h1>
	{#each aisles as aisle}
		<div class="aisle-preview">
			<div class="bg">
				<picture>
					<source
						srcset="/{aisle.products[0].image}-400.webp, /{aisle.products[0].image}-800.webp 2x"
						media="(max-width:400px)"
						type="image/webp"
					/>
					<source
						srcset="/{aisle.products[0].image}-400.jpg, /{aisle.products[0].image}-800.jpg 2x"
						media="(max-width:400px)"
						type="image/jpeg"
					/>
					<source
						srcset="/{aisle.products[0].image}-600.webp, /{aisle.products[0].image}-1200.webp 2x"
						media="(max-width:600px)"
						type="image/webp"
					/>
					<source
						srcset="/{aisle.products[0].image}-600.jpg, /{aisle.products[0].image}-1200.jpg 2x"
						media="(max-width:600px)"
						type="image/jpeg"
					/>
					<source
						srcset="/{aisle.products[0].image}-800.webp"
						media="(max-width:800px)"
						type="image/webp"
					/>
					<source
						srcset="/{aisle.products[0].image}-800.jpg"
						media="(max-width:800px)"
						type="image/jpeg"
					/>
					<source srcset="/{aisle.products[0].image}-1200.webp" type="image/webp" />
					<source srcset="/{aisle.products[0].image}-1200.jpg" type="image/jpeg" />
					<img src="/{aisle.products[0].image}-400.jpg" alt="hi:)" class="bg-image" />
				</picture>
			</div>
			<p class="aisle-name">
				{aisle.name}
			</p>
			<div class="aisle-products">
				{#each aisle.products as product}
					<div class="product-box">
						<div class="img-container">
							<picture>
								<source
									srcset="/{product.image}-120.webp, /{product.image}-240.webp 2x"
									media="(max-width:1000px)"
									type="image/webp"
								/>
								<source
									srcset="/{product.image}-120.jpg, /{product.image}-240.jpg 2x"
									media="(max-width:1000px)"
									type="image/jpeg"
								/>
								<source
									srcset="/{product.image}-240.webp, /{product.image}-400.webp 2x"
									type="image/webp"
								/>
								<source
									srcset="/{product.image}-240.jpg, /{product.image}-400.jpg 2x"
									type="image/jpeg"
								/>

								<img src="/{product.image}-240.jpg" alt="hi:)" class="bg-image" />
							</picture>
						</div>
						<a href="/products/{product.name}">{product.name}</a>
					</div>
				{/each}
				<div class="clear-box">
					<a href="/aisles/{aisle.name}" class="more">More</a>
				</div>
			</div>
		</div>
	{/each}
</div>
<style>
	.home-wrapper{
		padding-bottom: 0;
		margin-top: 0;
	}
	.aisles-wrapper {
		border-bottom: 0.1rem var(--main-color) solid;
		background-color: white;
		box-shadow: none;
	}
	.aisles-wrapper > h1 {
		margin-top: 0;
		margin-bottom: 1.5rem;
	}
	.aisle-preview {
		width: 100%;
		position: relative;
		z-index: 1;
		border-top: 0.1rem var(--main-color) solid;
		background: var(--main-color);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.aisle-preview:nth-of-type(1) {
		box-shadow: 0 -0.25rem 0.5rem rgba(0, 0, 0, 0.15);
	}
	.aisle-preview .bg {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: -1;
	}
	.aisle-preview .bg img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		filter: brightness(0.5) saturate(0.5);
	}
	.aisle-preview .aisle-name {
		font-size: 2rem;
		font-weight: 700;
		-webkit-text-stroke-width: 0.05rem;
		-webkit-text-stroke-color: white;
		text-align: center;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.aisle-preview .aisle-products {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		max-width: 80vw;
		margin-bottom: 2rem;
	}
	.aisle-preview .aisle-products .product-box {
		border: 0.25rem solid white;
		background-color: white;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0.1rem 0.5rem rgb(0, 0, 0);
	}
	.aisle-preview .aisle-products .product-box .img-container {
		position: relative;
		height: 0;
		padding-top: 100%;
		width: 6rem;
	}
	.aisle-preview .aisle-products .product-box .img-container img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.aisle-preview .aisle-products .product-box a {
		background: white;
		width: 100%;
		color: black;
	}
	.aisle-preview .aisle-products .clear-box {
		border: 0.25rem solid white;
		background-color: rgba(255, 255, 255, 0.514);
		backdrop-filter: blur(4px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0.1rem 0.5rem rgb(0, 0, 0);
	}
	.aisle-preview .aisle-products .clear-box .more {
		width: 6rem;
		text-align: center;
		font-size: 1.5rem;
		font-weight: 700;
		color: black;
		text-decoration-color: black;
	}

</style>