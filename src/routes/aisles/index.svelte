<script>
	let aisles = [
		{ name: 'Fruits', image: 'strawberries' },
		{ name: 'Vegetables', image: 'cucumber' },
		{ name: 'Meat', image: 'steak' },
		{ name: 'Dairy', image: 'milk' }
	];
</script>

<h1>Aisles</h1>
<div class="aisles-wrapper">
	<div class="aisles">
		{#each aisles as aisle}
			<a href={'/aisles/' + aisle.name}>
				<div class="img-container">
					<picture>
						<source
							srcset="/{aisle.image}-120.jpg, /{aisle.image}-400.jpg 2x"
							media="(max-width:500px)"
							type="image/jpeg"
						/>
						<source
							srcset="/{aisle.image}-400.jpg, /{aisle.image}-800.jpg 2x"
							media="(max-width:768px)"
							type="image/jpeg"
						/>
						<source srcset="/{aisle.image}-600.jpg" media="(max-width:1280px)" type="image/jpeg" />
						<source srcset="/{aisle.image}-800.jpg" media="(max-width:1920px)" type="image/jpeg" />
						<source srcset="/{aisle.image}-1200.jpg" type="image/jpeg" />
						<img src="/{aisle.image}-400.jpg" alt="hi:)" class="bg-image" />
					</picture>
				</div>

				<h2>{aisle.name}</h2>
			</a>
		{/each}
	</div>
</div>
