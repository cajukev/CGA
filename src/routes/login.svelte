<h1>User Login</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Email*:</label>
		<input type="text" name="email" id="email" required />
		<label for="password">Password*:</label>
		<input type="password" name="password" id="password" required />
		<button >Submit</button>
	</form>
</div>

<style>
  .form-wrapper{
    display: flex;
		flex-direction: column;
    align-items: center;
		width: 100%;
  }
	form {
		display: flex;
		flex-direction: column;
		width: 100%;
    margin-top: 1.5rem;
    max-width: 30rem;
    border: 0.1rem solid var(--main-color);
    background-color: white;  
    filter: drop-shadow(0px 0.25rem 0.5rem rgba(0, 0, 0, 0.25));
    padding: 1rem;
    color: var(--dark-text);
	}
  form > input[type='text'],form > input[type='password'] {
    border: 0.1rem solid var(--main-color);
    padding: 0.2rem;
  }
  form > input, form > label{
    margin-bottom: 0.5rem;
  }
  form > button{
    width: 5rem;
  }
</style>
