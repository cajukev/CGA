<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const productName = page.path.split('/')[3];
		return {
			props: {
				productName
			}
		};
	}
</script>

<script>
	import { goto } from '$app/navigation';

	export let productName;
	import { onMount } from 'svelte';
	let product = {};
	onMount(async () => {
		const res = await fetch('/api/productbyname', {
			method: 'POST',
			body: JSON.stringify({ name: productName })
		})
			.then((response) => response.json())
			.then((json) => {
				return json;
			});
		let data = await res;
		console.log(await res.data[0].data);
		product = await res.data[0].data;
	});

	let name, price, rebate, origin, description, image, aisle;
	let save = async () => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/editproduct', {
			method: 'POST',
			body: JSON.stringify({
				ogname: productName,
				secret: secret,
				name: name.value,
				price: price.value,
				rebate: rebate.value,
				origin: origin.value,
				description: description.value,
				image: image.value,
				aisle: aisle.value
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
		if (name.value == productName) {
			location.reload();
		} else {
			goto('/backstore/products/' + name.value);
			location.reload();
		}
	};
</script>

<h1>{product.name}</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Name*:</label>
		<input bind:this={name} value={product.name} type="text" name="name" id="name" required />
		<label for="password">Price*:</label>
		<input bind:this={price} value={product.price} type="text" name="price" id="price" required />
		<label for="rebate">Rebate*:</label>
		<input
			bind:this={rebate}
			value={product.rebate}
			type="text"
			name="rebate"
			id="rebate"
			required
		/>
		<label for="origin">Origin*:</label>
		<input
			bind:this={origin}
			value={product.origin}
			type="text"
			name="origin"
			id="origin"
			required
		/>
		<label for="description">Description*:</label>
		<input
			bind:this={description}
			value={product.description}
			type="text"
			name="description"
			id="description"
			required
		/>
		<label for="origin">Image*:</label>
		<input bind:this={image} value={product.image} type="text" name="image" id="image" required />
		<label for="description">Aisle*:</label>
		<select bind:this={aisle} name="aisle" value={product.aisle} id="aisle" required>
			<option value="Fruits">Fruits</option>
			<option value="Vegetables">Vegetables</option>
			<option value="Meats">Meats</option>
			<option value="Dairy">Dairy</option>
		</select>

		<input value="submit" on:click={save} type="button" />
	</form>
</div>

<style lang="scss">
	h1 {
		text-align: center;
	}
	form,
	input,
	select {
		background-color: #efefef;
	}
</style>
