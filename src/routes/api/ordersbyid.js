import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
  const secret = items.secret
	const id = items.id;
	const client = new faunadb.Client({
		secret: secret
	});

	const orders = client
		.query(
			q.Get(q.Ref(q.Collection("orders"), id))
		)
		.then((ret) => {
			return ret;
		})


	return {
		body: await orders
	};
}
