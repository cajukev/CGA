import faunadb, { Collection } from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
	const items = JSON.parse(request.body);
	const ogemail = items.ogemail;
	const email = items.email;
	const secret = items.secret;
	const client = new faunadb.Client({
		secret: secret
	});

	const userChange = client
		.query(q.Paginate(q.Match(q.Index('users_by_email'), [ogemail])))
		.then((ret) => {
			console.log(ret);
			let collection = String(ret.data[0]).split('"')[1];
			let id = String(ret.data[0]).split('"')[3];

			return client
				.query(
					q.Update(q.Ref(q.Collection(collection), id), {
						data: {
							email: email
						}
					})
				)
				.then((ret) => {
					return client.query(q.Paginate(q.Match(q.Index('orders_by_email'), [ogemail]))).then((ret) => {
						ret.data.forEach((order) => {
							let o_collection = String(order).split('"')[1];
							let o_id = String(order).split('"')[3];
							return client
								.query(
									q.Update(q.Ref(q.Collection(o_collection), o_id), {
										data: {
											email: email
										}
									})
								)
								.then((ret) => {
									return ret;
								});
						});
					});
				});
		});

	return {
		body: await userChange
	};
}
