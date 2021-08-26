import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
  const secret = items.secret
	const email = items.email;
	const client = new faunadb.Client({
		secret: secret
	});

	const orders = client
		.query(
			q.Map(
				q.Paginate(q.Match(q.Index('orders_by_email'),[email])),
				q.Lambda((x) => q.Get(x))
			)
		)
		.then((ret) => {
			return ret;
		})


	return {
		body: await orders
	};
}
