<script>
  export let product;
</script>
<div class="p-card">
  <img src={'/'+product.image} alt={product.name} class="bg-image" />
  <div class="image-gradient" />
  <div class="text">
    <h2 class="name">{product.name}</h2>
    {#if product.rebate != 0}
      <p class="rebate-price">{'$' + (product.price - product.rebate)}</p>
    {:else}
      <div class="empty" />
    {/if}
    <a href={'/products/' + product.name.split(' ').join('-')} class="learn-more"
      >Learn More</a
    >
    <h2 class="price">{'$' + product.price}</h2>
  </div>
</div>

<style>
  
</style>