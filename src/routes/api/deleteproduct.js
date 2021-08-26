import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
	const items = JSON.parse(request.body);
	const name = items.name;
	const secret = items.secret;
	const client = new faunadb.Client({
		secret: secret
	});

	const products = client
		.query(q.Paginate(q.Match(q.Index('product_by_name'), [name])))
		.then((ret) => {
			let collection = String(ret.data[0]).split('"')[1];
			let id = String(ret.data[0]).split('"')[3];

			return client
				.query(
					q.Delete(q.Ref(q.Collection(collection), id))
				)
				.then((ret) => {
					console.log(ret);
          return ret
				});
		});

	return {
		body: await products
	};
}
