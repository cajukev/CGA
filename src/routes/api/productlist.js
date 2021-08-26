import faunadb from 'faunadb';

export async function get({ params }) {
	const q = faunadb.query;
	const adminSecret = import.meta.env.VITE_FAUNA_ADMIN;
	const client = new faunadb.Client({
		secret: adminSecret
	});

	const products = client
		.query(
			q.Map(
				q.Paginate(q.Match(q.Index('all_products'))),
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
