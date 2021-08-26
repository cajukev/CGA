import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
	const name = items.name;
	const adminSecret = import.meta.env.VITE_FAUNA_ADMIN;
	const client = new faunadb.Client({
		secret: adminSecret
	});

	const products = client
		.query(
			q.Map(
				q.Paginate(q.Match(q.Index('product_by_name'),[name])),
				q.Lambda((x) => q.Get(x))
			)
		)
		.then((ret) => {
			return ret;
		})


	return {
		body: await products
	};
}
