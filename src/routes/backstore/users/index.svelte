<script>
	import { userCredentials } from '../../../stores';
	import { onMount } from 'svelte';

	let userList = [];
	onMount(async () => {
		const res = await fetch('/api/userlist', {
			method: 'POST',
			body: JSON.stringify({ secret: $userCredentials.secret })
		})
			.then((response) => response.json())
			.then((json) => {
				return json;
			});
    let data = await res;
		let tempList = []
		data.data.forEach((user) => {
			tempList.push(user.data);
		});
    userList =  tempList
	});
	let deleteUser = async (user) => {
		let secret = JSON.parse(localStorage.getItem('userCredentials')).secret;
		const res = await fetch('/api/deleteuser', {
			method: 'POST',
			body: JSON.stringify({
				email: user,
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
</script>

<h1>User List</h1>
{#if $userCredentials.type != 'manager'}
	<p class="unauthorized">You are not allowed here >:(</p>
{:else}
<div class="userList">
	{#each userList as user }
	<div class="elem">
		<p class="name">{user.email}</p>
		<a sveltekit:prefetch href="/backstore/users/{user.email}">Edit User</a>
		<p class="action" on:click={deleteUser(user.email)}>Delete User</p>
	</div>
	{/each}
	<div class="elem new ">
		<a sveltekit:prefetch href="/backstore/users/new">Add a User</a>
	</div>
</div>
{/if}

<style lang="scss">
	h1{
		text-align: center;
	}
	.unauthorized{
		text-align: center;
	}
.userList {
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