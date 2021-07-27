<script>
	import productList from '../products.json';
	import { cart } from '../stores'
	let cart_value;

	let sum = 0;
	$: {
		sum = 0;
		Object.values($cart).map((item) => {
			sum = sum + item.price;
		});
	}
</script>

<div class="cart-wrapper">
	<h1>Shopping Cart ({$cart.length})</h1>
	<div class="cart">
		<div class="items">
			{#each $cart as product}
				<div class="item">
					<img src={'/' + product.image} alt={product.name} />
					<div class="text">
						<p class="name">{product.name + ' (' + product.amount + ')'}</p>
						{#if product.rebate != 0}
							<p class="price">{'$' + (product.price - product.rebate)}</p>
						{:else}
							<p class="price">{'$' + product.price}</p>
						{/if}
						<div class="buttons">
							<span>+</span>
							<span>-</span>
							<svg viewBox="0 0 24 24" fill="var(--dark-text)"
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
			<p><i>{$cart.length} Items - ${sum.toFixed(2)}</i></p>
			<p><i>GST - ${(sum * 0.05).toFixed(2)}</i></p>
			<p><i>QST - ${(sum * 0.09975).toFixed(2)}</i></p>
			<p class="total">Total: ${(sum * 1.14975).toFixed(2)}</p>
		</div>
		<div class="buttons">
			<button class='checkout' >Checkout</button>
			<button class='continue'>Continue Shopping</button>
		</div>
	</div>
</div>

<style>

</style>
