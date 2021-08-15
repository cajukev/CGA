<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const product = page.path.split('/')[2];
		return {
			props: {
				product
			}
		};
	}
</script>

<script>
	export let product;
	import productList from '../../products.json';
	import {onMount} from 'svelte';
	import { cart } from '../../stores';

	let currentProduct;
	console.log(product);
	productList.productList.forEach((item) => {
		if (product === item.name.split(' ').join('-')) {
			currentProduct = item;
		}
	});

	let qty;
	onMount(()=> {
		qty = localStorage.getItem(`${product}-qty`) || 1;
	})

	let handleMinus = () => {
		if(qty != 1){
			qty = qty -1;
		}
		localStorage.setItem(`${product}-qty`,qty)
	}
	let handlePlus = () => {
		qty = parseInt(qty) + 1;
		localStorage.setItem(`${product}-qty`,qty)

	}
	let addToCart = () => {
		
		for (var i = 0 ; i < $cart.length ; i++){
			if($cart[i].name == product){
				$cart[i].amount = parseInt($cart[i].amount) + qty
				return false;
			}
		}
		
		$cart.push(currentProduct)
		$cart[$cart.indexOf(currentProduct)].amount = qty
		console.log($cart)
		/*
		if($cart[$cart.indexOf(currentProduct)]){
			
		}else{
			let temp = currentProduct;
			temp.amount = parseInt(temp.amount) + qty
			$cart.push(temp)
			console.log(temp)
			console.log($cart)
		}*/
	}
</script>

<div class="product-wrapper">
	<a href={'/aisles/' + currentProduct.aisle}>{currentProduct.aisle} Aisle</a>
	<h1 class="product-name">{currentProduct.name}</h1>
	<div class="product">
		<div class="img-container">
			<picture>
				<source
					srcset="/{currentProduct.name}-120.jpg, /{currentProduct.name}-400.jpg 2x"
					media="(max-width:500px)"
					type="image/jpeg"
				/>
				<source
					srcset="/{currentProduct.name}-400.jpg, /{currentProduct.name}-800.jpg 2x"
					media="(max-width:768px)"
					type="image/jpeg"
				/>
				<source srcset="/{currentProduct.name}-600.jpg" media="(max-width:1280px)" type="image/jpeg" />
				<source srcset="/{currentProduct.name}-800.jpg" media="(max-width:1920px)" type="image/jpeg" />
				<source srcset="/{currentProduct.name}-1200.jpg" type="image/jpeg" />
				<img src="/{currentProduct.name}-400.jpg" alt="hi:)" />
			</picture>
		</div>
		
		<!--img src={'/' + currentProduct.image + '-1200.jpg'} alt={currentProduct.name} /-->
		<div class="information">
			<div class="prices">
				{#if currentProduct.rebate != 0}
					<p class="rebate-price"><s>{'$' + (currentProduct.price * qty).toFixed(2)}</s></p>
				{/if}
				<p class="current-price">{'$' + (currentProduct.price * qty - currentProduct.rebate * qty).toFixed(2)}</p>
			</div>
			<div class="quantityPicker">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" id="minus" on:click={handleMinus}>
					<path
						d="M5 12H19M3 23H21C22.1046 23 23 22.1046 23 21V3C23 1.89543 22.1046 1 21 1H3C1.89543 1 1 1.89543 1 3V21C1 22.1046 1.89543 23 3 23Z"
						stroke="#82172C"
					/>
				</svg>

				{qty}
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" id="plus" on:click={handlePlus}>
					<path
						d="M12 5V12M12 12V19M12 12H5M12 12H19M3 23H21C22.1046 23 23 22.1046 23 21V3C23 1.89543 22.1046 1 21 1H3C1.89543 1 1 1.89543 1 3V21C1 22.1046 1.89543 23 3 23Z"
						stroke="#82172C"
					/>
				</svg>
			</div>
			<button class="add-to-cart" on:click={addToCart}>Add To Cart</button>
			<div class="origin">
				<i>Made in {currentProduct.origin}</i>
				{#if currentProduct.origin == 'Quebec'}
					<svg viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M15.7143 7.49286L13.9714 5.5L14.2143 2.86429L11.6357 2.27857L10.2857 0L7.85714 1.04286L5.42857 0L4.07857 2.27857L1.5 2.85714L1.74286 5.5L0 7.49286L1.74286 9.48571L1.5 12.1286L4.07857 12.7143L5.42857 15L7.85714 13.95L10.2857 14.9929L11.6357 12.7143L14.2143 12.1286L13.9714 9.49286L15.7143 7.49286ZM12.8929 8.55L12.4929 9.01429L12.55 9.62143L12.6786 11.0143L11.3214 11.3214L10.7214 11.4571L10.4071 11.9857L9.7 13.1857L8.42857 12.6357L7.85714 12.3929L7.29286 12.6357L6.02143 13.1857L5.31429 11.9929L5 11.4643L4.4 11.3286L3.04286 11.0214L3.17143 9.62143L3.22857 9.01429L2.82857 8.55L1.90714 7.5L2.82857 6.44286L3.22857 5.97857L3.16429 5.36429L3.03571 3.97857L4.39286 3.67143L4.99286 3.53571L5.30714 3.00714L6.01429 1.80714L7.28572 2.35714L7.85714 2.6L8.42143 2.35714L9.69286 1.80714L10.4 3.00714L10.7143 3.53571L11.3143 3.67143L12.6714 3.97857L12.5429 5.37143L12.4857 5.97857L12.8857 6.44286L13.8071 7.49286L12.8929 8.55Z"
							fill="#912338"
						/>
						<path
							d="M12.8929 8.55L12.4929 9.01429L12.55 9.62143L12.6786 11.0143L11.3214 11.3214L10.7214 11.4571L10.4071 11.9857L9.7 13.1857L8.42857 12.6357L7.85714 12.3929L7.29286 12.6357L6.02143 13.1857L5.31429 11.9929L5 11.4643L4.4 11.3286L3.04286 11.0214L3.17143 9.62143L3.22857 9.01429L2.82857 8.55L1.90714 7.5L2.82857 6.44286L3.22857 5.97857L3.16429 5.36429L3.03571 3.97857L4.39286 3.67143L4.99286 3.53571L5.30714 3.00714L6.01429 1.80714L7.28572 2.35714L7.85714 2.6L8.42143 2.35714L9.69286 1.80714L10.4 3.00714L10.7143 3.53571L11.3143 3.67143L12.6714 3.97857L12.5429 5.37143L12.4857 5.97857L12.8857 6.44286L13.8071 7.49286L12.8929 8.55Z"
							fill="#912338"
						/>
						<path
							d="M6.49261 8.75L4.83546 7.08572L3.77832 8.15L6.49261 10.8714L11.7355 5.61429L10.6783 4.55L6.49261 8.75Z"
							fill="white"
						/>
					</svg>
				{/if}
			</div>
			<div class="description">
				<div
					class="button"
					on:click={() => {
						document.getElementById('text').classList.toggle('active');
						document.getElementById('arrow').classList.toggle('active');
					}}
				>
					<p>Detailed Description</p>
					<svg viewBox="0 0 11 6" fill="none" id="arrow" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M5.51288 5.04852L9.41569 0L11 0L6.13115 6H4.88173L0 0L1.59719 0L5.51288 5.04852Z"
							fill="#561925"
						/>
					</svg>
				</div>
				<div class="text" id="text">{currentProduct.description}</div>
			</div>
		</div>
	</div>
</div>

<style>
</style>
