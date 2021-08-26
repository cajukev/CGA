<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const orderID = page.path.split('/')[3];
		return {
			props: {
				orderID
			}
		};
	}
</script>

<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	export let orderID;
	let order = {cart:[]};
	onMount(async () => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/ordersbyid', {
			method: 'POST',
			body: JSON.stringify({ id: orderID, secret: secret })
		})
			.then((response) => response.json())
			.then((json) => {
				return json.data;
			});
		order = await res;
		console.log(await order.cart);
	});
	let email;

	let save = async () => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/editorder', {
			method: 'POST',
			body: JSON.stringify({
				id: orderID,
        cart: order.cart,
				secret: secret,
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
	};

  let handleMinus = (product) => {
		order.cart[order.cart.indexOf(product)].amount = order.cart[order.cart.indexOf(product)].amount - 1;
		if (order.cart[order.cart.indexOf(product)].amount == 0) {
			handleDelete(product);
		}
	};
	let handlePlus = (product) => {
		order.cart[order.cart.indexOf(product)].amount = order.cart[order.cart.indexOf(product)].amount + 1;
	};
	let handleDelete = (product) => {
		console.log('delete');
		order.cart[order.cart.indexOf(product)].amount = order.cart[order.cart.indexOf(product)].amount - 1;
		order.cart.splice(order.cart.indexOf(product), 1);
	};
</script>

<h1>{orderID}</h1>
<div class="cart">
  <div class="items">
    {#each order.cart as product}
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
  <input value="Save" on:click={save} type="button" />
</div>
<style lang="scss">
  h1{
    text-align: center;
  }
  .cart{
    margin: auto;
    display: block;
    & .items{
      margin-top: 1.5rem;
      flex-direction: row;
      flex-wrap: wrap;
      & .item{
        margin-right: 1rem;
      }
    }
  }
</style>