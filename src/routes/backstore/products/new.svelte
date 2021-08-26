<script>
  let name, price, rebate, origin, description, image, aisle;
  let save = async () => {
    let secret = JSON.parse(localStorage.getItem('userCredentials')).secret
		const res = await fetch('/api/newproduct', {
			method: 'POST',
			body: JSON.stringify({ secret: secret, name: name.value, price: price.value, rebate: rebate.value, origin: origin.value, description: description.value, image: image.value, aisle:aisle.value })
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

<h1>New Product</h1>
<div class="form-wrapper">
	<form action="">
		<label for="email">Name*:</label>
		<input bind:this={name} value='New Product' type="text" name="name" id="name" required />
		<label for="password">Price*:</label>
		<input bind:this={price} value='0.00' type="text" name="price" id="price" required />
    <label for="rebate">Rebate*:</label>
		<input bind:this={rebate} value='0.00' type="text" name="rebate" id="rebate" required />
    <label for="origin">Origin*:</label>
		<input bind:this={origin} value='Origin' type="text" name="origin" id="origin" required />
    <label for="description">Description*:</label>
		<input bind:this={description} value='Description' type="text" name="description" id="description" required />
    <label for="origin">Image*:</label>
		<input bind:this={image} value='Fruits' type="text" name="image" id="image" required />
    <label for="description">Aisle*:</label>
		<select bind:this={aisle} name="aisle" id="aisle" required >
      <option value="Fruits">Fruits</option>
      <option value="Vegetables">Vegetables</option>
      <option value="Meats">Meats</option>
      <option value="Dairy">Dairy</option>
    </select>

			<input value='submit' on:click={save} type="button"/>
	</form>
</div>

<style>
  h1{
    text-align: center;
  }
  form, input, select{
    background-color: #efefef;
  }
</style>