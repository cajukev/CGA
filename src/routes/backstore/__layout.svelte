<h1>Super Secret Backstore</h1>
<div class="backstore-nav-wrapper">
  <div class="nav">
    <a href="/backstore/products/">Product List</a>
    <a href="/backstore/users/">User List</a>
    <a class="orders" href="/backstore/orders/">Order List</a>
  </div>
</div>

<div class="grey-bg"><slot /></div>

<style>
  .backstore-nav-wrapper{
    text-align: center;
  }
  .backstore-nav-wrapper > .nav > a{
    color: var(--dark-text);
    
  }
  .backstore-nav-wrapper > .nav > a:not(.orders){
    margin-right: 1rem;
  }
	.grey-bg {
		background-color: #efefef;
	}
</style>
