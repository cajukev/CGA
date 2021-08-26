<script>
	import { userCredentials } from '../../../stores';
	import { onMount } from 'svelte';

	let orderList = [];
	onMount(async () => {
		const res = await fetch('/api/orderlist', {
			method: 'POST',
			body: JSON.stringify({ secret: $userCredentials.secret })
		})
			.then((response) => response.json())
			.then((json) => {
				return json;
			});
    let data = await res;
    console.log(await data)
		let tempList = []
		data.data.forEach((order) => {
			tempList.push(order);
		});
    orderList =  tempList
	});
	let deleteOrder = async (order) => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/deleteorder', {
			method: 'POST',
			body: JSON.stringify({
				id: order,
				secret: secret
			})
		})
			.catch((err) => {
				return err;
			})
			.then((response) => response.json())
			.then((json) => {
				console.log(json.data);

				return json;
			});
			location.reload();
	};

  let sum = (cart) => {
    let sum = 0
    cart.forEach(product => {
      sum = sum + product.amount
    });
    return sum
  }
</script>


<h1>Order List</h1>
{#if $userCredentials.type != 'manager'}
	<p class="unauthorized">You are not allowed here >:(</p>
{:else}
<div class="orderList">
  {#each orderList as order }
  <div class="elem">
		<p class="name">{order.ref["@ref"].id} - {order.data.email} - ({sum(order.data.cart)})</p>
		<a sveltekit:prefetch href="/backstore/orders/{order.ref["@ref"].id}">Edit Order</a>
    <p class="action" on:click={deleteOrder(order.ref["@ref"].id)}>Delete Order</p>
	</div>
  {/each}
</div>
{/if}

<style lang="scss">
  h1{
    text-align: center;
  }
  .unauthorized{
    text-align: center;
  }
  .orderList {
		display: grid;
		max-width: 80vw;
		margin: auto;
		grid-template-columns: 1fr;
		gap: 1rem 1rem;
		margin-top: 2rem;
		align-content: center;
		justify-items: center;
		& .elem {
			display: flex;
			flex-wrap: wrap;
			width: 100%;
			border: 1px solid rgb(206, 206, 206);
			padding: 0.5rem;
			& p, a{
				margin-right: 1rem;
			}
      & .action{
					cursor: pointer;
				}
		}
	}
</style>