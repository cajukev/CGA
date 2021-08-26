<script>
import { Ref } from "faunadb";
import { userCredentials } from '../stores';
import { goto } from '$app/navigation';


	let email;
	let password;
	let login = async () => {
		const res = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: email.value, password: password.value })
		})
			.catch((err)=>{return err})
			.then((response) => response.json())
			.then((json) => {
				console.log(json.data[0])
				$userCredentials.secret = json.data[0].secret
				$userCredentials.type = json.data[1]
				$userCredentials.email = json.data[2]
				switch(json.data[1]){
					case '':
						break;
					case 'user':
						goto('/')
						break;
					case 'manager':
						goto('/backstore/products')
						break;
				}
				
				return json;
			});
	};
</script>

<h1>User Login</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Email*:</label>
		<input bind:this={email} type="text" name="email" id="email" required />
		<label for="password">Password*:</label>
		<input bind:this={password} type="password" name="password" id="password" required />
		<div class="buttons">
			<button on:click={login} type="button">Submit</button>
			<button on:click={login} type="button">Forget Password</button>
		</div>
	</form>
</div>
<style lang="scss">
	h1{
		text-align: center;
	}
</style>