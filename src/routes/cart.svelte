<script>
	import productList from '../products.json';
	import { cart } from '../stores';
	import { onMount } from 'svelte';

	let sum = 0;
	let totalQuantity = 0;

	$: {
		totalQuantity = 0;
		sum = 0;
		Object.values($cart).map((item) => {
			totalQuantity = totalQuantity + item.amount;
			sum = sum + (item.price - item.rebate) * item.amount;
		});
		if (typeof window !== 'undefined') {
			localStorage.setItem('cart', JSON.stringify($cart));
		}
	}

	let handleMinus = (product) => {
		$cart[$cart.indexOf(product)].amount = $cart[$cart.indexOf(product)].amount - 1;
		if ($cart[$cart.indexOf(product)].amount == 0) {
			handleDelete(product);
		}
	};
	let handlePlus = (product) => {
		$cart[$cart.indexOf(product)].amount = $cart[$cart.indexOf(product)].amount + 1;
	};
	let handleDelete = (product) => {
		console.log('delete');
		$cart[$cart.indexOf(product)].amount = $cart[$cart.indexOf(product)].amount - 1;
		$cart.splice($cart.indexOf(product), 1);
	};

	let checkout = async () => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret
		let email = JSON.parse(localStorage.getItem('userCredentials')).email
		const res = await fetch('/api/checkout', {
			method: 'POST',
			body: JSON.stringify({ secret: secret, user: email, cart: $cart })
		})
			.catch((err)=>{return err})
			.then((response) => response.json())
			.then((json) => {
				console.log(json.data)
				switch(json.data){
					case '':
						break;
					case 'user':
						goto('/')
						break;
					case 'manager':
						goto('/backstore/products')
						break;
				}
				
				return json;
			});
			$cart = []
	};
</script>

<div class="cart-wrapper">
	<h1>Shopping Cart ({totalQuantity})</h1>
	<div class="cart">
		<div class="items">
			{#each $cart as product}
				<div class="item">
					<img src="/{product.image}-120.jpg" alt="hi:)" class="bg-image"/>

					<div class="text">
						<p class="name">{product.name + ' (' + product.amount + ')'}</p>
						{#if product.rebate != 0}
							<p class="price">{'$' + (product.price - product.rebate).toFixed(2)}</p>
						{:else}
							<p class="price">{'$' + (parseFloat(product.price).toFixed(2))}</p>
						{/if}
						<div class="buttons">
							<span on:click={handlePlus(product)}>+</span>
							<span on:click={handleMinus(product)}>-</span>
							<svg on:click={handleDelete(product)} viewBox="0 0 24 24" fill="var(--dark-text)"
								><path d="M0 0h24v24H0V0z" fill="none" /><path
									d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
								/></svg
							>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="summary">
			<p><i>{totalQuantity} Items - ${sum.toFixed(2)}</i></p>
			<p><i>GST - ${(sum * 0.05).toFixed(2)}</i></p>
			<p><i>QST - ${(sum * 0.09975).toFixed(2)}</i></p>
			<p class="total">Total: ${(sum * 1.14975).toFixed(2)}</p>
		</div>
		<div class="buttons">
			<button class="checkout" on:click={() => checkout()}>Checkout</button>
			<a sveltekit:prefetch class="continue" href="/">Continue Shopping</a>
		</div>
	</div>
</div>

<style>
</style>
