<script>
import { goto } from "$app/navigation";


	let email;
	let password;
	let password2;
	let signUp = async () => {
		let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (password.value == password2.value && regex.test(email.value)) {
			let secret = import.meta.env.VITE_FAUNA_ADMIN;
			const res = await fetch('/api/newUser', {
				method: 'POST',
				body: JSON.stringify({ secret: secret, email: email.value, password: password.value })
			})
				.catch((err) => {
					return err;
				})
				.then((response) => response.json())
				.then((json) => {
					console.log(json)
					if(json != undefined){
						goto('/login')
					};
					return json;
				});
		}else{
			alert('Email is invalid or passwords do not match')
		}
	};
</script>

<h1>User Sign Up</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Email*:</label>
		<input bind:this={email} type="text" name="email" id="email" required />
		<label for="password">Password*:</label>
		<input bind:this={password} type="password" name="password" id="password" required />
		<label for="password2">Confirm Password*:</label>
		<input bind:this={password2} type="password" name="password2" id="password2 required" />
		<div class="buttons">
			<button on:click={signUp} type="button">Sign Up</button>
		</div>
		
	</form>
</div>

<style>
	h1{
		text-align: center;
	}
</style>
