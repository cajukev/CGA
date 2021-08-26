import faunadb from 'faunadb';


export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
	const secret = items.secret;
  const user = items.user
  const cart = items.cart
  
	const client = new faunadb.Client({
		secret: secret
	});

	const checkout = client
		.query(
			q.Create(q.Collection("orders"), {
        data: {
          email: user,
          cart: cart
        }
      })
		)
		.then((ret) => {
			return ret;
		})


	return {
		body: await checkout
	};
}
