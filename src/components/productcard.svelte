<script>
	export let product;
</script>

<div class="p-card">
	<div class="img-container">
		<picture>
			<source
				srcset="/{product.image}-240.webp, /{product.image}-400.webp 2x"
				media="(max-width:360px)"
				type="image/webp"
			/>
			<source
				srcset="/{product.image}-240.jpg, /{product.image}-400.jpg 2x"
				media="(max-width:360px)"
				type="image/jpeg"
			/>
			<source
				srcset="/{product.image}-400.webp, /{product.image}-800.webp 2x"
				media="(max-width:600px)"
				type="image/webp"
			/>
			<source
				srcset="/{product.image}-400.jpg, /{product.image}-800.jpg 2x"
				media="(max-width:600px)"
				type="image/jpeg"
			/>
			<source srcset="/{product.image}-600.webp" media="(max-width:864px)" type="image/webp" />
			<source srcset="/{product.image}-600.jpg" media="(max-width:864px)" type="image/jpeg" />
			<source srcset="/{product.image}-800.webp" media="(max-width:1280px)" type="image/webp" />
			<source srcset="/{product.image}-800.jpg" media="(max-width:1280px)" type="image/jpeg" />
			<source srcset="/{product.image}-400.webp" type="image/webp" />
			<source srcset="/{product.image}-400.jpg" type="image/jpeg" />
			<img src="/{product.image}-400.jpg" alt="hi:)" class="bg-image" />
		</picture>
	</div>

	<div class="image-gradient" />
	<div class="text">
		<h2 class="name">{product.name}</h2>
		{#if product.rebate != 0}
			<p class="rebate-price">{'$' + product.price}</p>
		{:else}
			<div class="empty" />
		{/if}
		<a sveltekit:prefetch href={'/products/' + product.name.split(' ').join('-')} class="learn-more">Learn More</a>
		<h2 class="price">{'$' + (product.price - product.rebate).toFixed(2)}</h2>
	</div>
</div>

<style>
</style>
