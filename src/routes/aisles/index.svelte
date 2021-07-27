<script>
  let aisles = [
		{ name: 'Fruits', image: 'strawberries.jpg' },
		{ name: 'Vegetables', image: 'cucumber.jpg' },
		{ name: 'Meat', image: 'steak.jpg' },
		{ name: 'Dairy', image: 'milk.jpg' },
	];
</script>
<h1>Aisles</h1>
<div class="aisles-wrapper">
  <div class="aisles">
    {#each aisles as aisle}
      <a href={'/aisles/' + aisle.name}>
        <img src={aisle.image} alt={aisle.name} />
        <h2>{aisle.name}</h2>
      </a>
    {/each}
  </div>
</div>
