<script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, context }) {
		const userEmail = page.path.split('/')[3];
		return {
			props: {
				userEmail
			}
		};
	}
</script>

<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	export let userEmail;
	let orders = [];
	onMount(async () => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/ordersbyemail', {
			method: 'POST',
			body: JSON.stringify({ email: userEmail, secret: secret })
		})
			.then((response) => response.json())
			.then((json) => {
				return json.data;
			});
		let data = await res;
		orders = data;
		console.log(await res);
	});
	let email;
	let save = async () => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/edituser', {
			method: 'POST',
			body: JSON.stringify({
				ogemail: userEmail,
				secret: secret,
				email: email.value
			})
		})
			.catch((err) => {
				return err;
			})
			.then((response) => response.json())
			.then((json) => {
				console.log(json.data);
				if (email.value == userEmail) {
					location.reload();
				} else {
					goto('/backstore/users/' + email.value);
					location.reload();
				}
				return json;
			});
	};
</script>

<h1>{userEmail}</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Email*:</label>
		<input bind:this={email} value={userEmail} type="text" name="name" id="name" required />
		<input value="Submit" on:click={save} type="button" />
	</form>
</div>
<h2>Orders</h2>
{#each orders as order}
	<div class="entry">
		<p>
			<a sveltekit:prefetch href="/backstore/orders/{order.ref['@ref'].id}"
				>{order.ref['@ref'].id}</a
			>
		</p>
	</div>
{/each}

<style lang="scss">
	h1,
	h2,
	p {
		text-align: center;
	}
	form,
	input {
		background-color: #efefef;
	}
</style>
