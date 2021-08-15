<script>
  export let product;
</script>
<div class="p-card">
  <div class="img-container">
    <picture>
      <source
        srcset="/{product.name}-120.jpg, /{product.name}-400.jpg 2x"
        media="(max-width:500px)"
        type="image/jpeg"
      />
      <source
        srcset="/{product.name}-400.jpg, /{product.name}-1800.jpg 2x"
        media="(max-width:768px)"
        type="image/jpeg"
      />
      <source srcset="/{product.name}-600.jpg" media="(max-width:1280px)" type="image/jpeg" />
      <source srcset="/{product.name}-800.jpg" media="(max-width:1920px)" type="image/jpeg" />
      <source srcset="/{product.name}-1200.jpg" type="image/jpeg" />
      <img src="/{product.name}-400.jpg" alt="hi:)" class="bg-image"/>
    </picture>
  </div>

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