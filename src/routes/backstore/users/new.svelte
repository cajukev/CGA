<script>
import { goto } from "$app/navigation";


  let email;
	let password;
  let save = async () => {
    let secret = JSON.parse(localStorage.getItem('userCredentials')).secret
		const res = await fetch('/api/newUser', {
			method: 'POST',
			body: JSON.stringify({ secret: secret, email: email.value, password: password.value})
		})
			.catch((err)=>{return err})
			.then((response) => response.json())
			.then((json) => {
				console.log(json.data)
				
				return json;
			});
    location.reload()
  }
</script>

<h1>New User</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Email*:</label>
		<input bind:this={email} value='' type="text" name="name" id="name" required />
		<label for="email">Password*:</label>
		<input bind:this={password} value='' type="password" name="password" id="password" required />
			<input value='Submit' on:click={save} type="button"/>
	</form>
</div>

<style>
  h1{
    text-align: center;
  }
  form, input{
    background-color: #efefef;
  }
</style>