<script context="module">
	export const load = async ({ fetch }) => {
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
			props: { productList: productList }
		};
	};
</script>

<script>
	import { cart, userCredentials } from '../../../stores';
	export let productList;

	let deleteProduct = async (product) => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/deleteproduct', {
			method: 'POST',
			body: JSON.stringify({
				name: product,
				secret: secret
			})
		})
			.catch((err) => {
				return err;
			})
			.then((response) => response.json())
			.then((json) => {
				console.log(json.data);

				return json;
			});
			location.reload();
	};
</script>

<h1>Product List</h1>
{#if $userCredentials.type != 'manager'}
	<p class="unauthorized">You are not allowed here >:(</p>
{:else}
	<div class="productList">
		{#each productList as product}
			<div class="elem">
				<picture>
					<source
						srcset="/{product.image}-120.webp, /{product.image}-240.webp 2x"
						media="(max-width:1200px)"
						type="image/webp"
					/>
					<source
						srcset="/{product.image}-120.jpg, /{product.image}-240.jpg 2x"
						media="(max-width:1200px)"
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
				<div class="text">
					<p class="name">{product.name}</p>
					<a sveltekit:prefetch class="action" href="/backstore/products/{product.name}">Edit Product</a>
					<p class="action" on:click={deleteProduct(product.name)}>Delete Product</p>
				</div>
			</div>
		{/each}
		<div class="elem new"><a sveltekit:prefetch href="/backstore/products/new">Add A Product</a></div>
	</div>
{/if}

<style lang="scss">
	h1 {
		text-align: center;
	}
	.unauthorized{
		text-align: center;
	}
	.productList {
		display: grid;
		max-width: 80vw;
		margin: auto;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1rem 1rem;
		margin-top: 2rem;
		align-content: center;
		justify-items: center;
		& .elem {
			display: flex;
			width: 100%;
			border: 1px solid rgb(206, 206, 206);
			& img {
				height: 100%;
				width: 4rem;
				object-fit: cover;
			}
			& .text {
				display: flex;
				flex-direction: column;
				justify-content: space-evenly;
				margin-left: 1rem;
				width: 100%;
				& .action{
					cursor: pointer;
				}
			}
		}
		& .new{
			justify-content: center;
			align-items: center;
		}
	}
</style>
