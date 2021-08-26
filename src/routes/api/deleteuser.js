import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
	const items = JSON.parse(request.body);
	const email = items.email;
	const secret = items.secret;
	const client = new faunadb.Client({
		secret: secret
	});

	const products = client
		.query(q.Paginate(q.Match(q.Index('users_by_email'), [email])))
		.then((ret) => {
			let collection = String(ret.data[0]).split('"')[1];
			let id = String(ret.data[0]).split('"')[3];

			return client
				.query(
					q.Delete(q.Ref(q.Collection(collection), id))
				)
				.then((ret) => {
					return client.query(q.Paginate(q.Match(q.Index('orders_by_email'), [email]))).then((ret) => {
						ret.data.forEach((order) => {
							let o_collection = String(order).split('"')[1];
							let o_id = String(order).split('"')[3];
							return client
								.query(
									q.Delete(q.Ref(q.Collection(o_collection), o_id))
								)
								.then((ret) => {
									return ret;
								});
						});
					});
				});
		});

	return {
		body: await products
	};
}
