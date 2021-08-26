<h1>Super Secret Backstore</h1>
<div class="backstore-nav-wrapper">
  <div class="nav">
    <a sveltekit:prefetch href="/backstore/products/">Product List</a>
    <a sveltekit:prefetch href="/backstore/users/">User List</a>
    <a sveltekit:prefetch class="orders" href="/backstore/orders/">Order List</a>
  </div>
</div>

<div class="grey-bg"><slot /></div>

<style>
  h1{
    text-align: center;
  }
</style>
