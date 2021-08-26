import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
	const items = JSON.parse(request.body);
	const ogname = items.ogname;
	const name = items.name;
	const price = items.price;
	const rebate = items.rebate;
	const origin = items.origin;
	const description = items.description;
	const image = items.image;
	const aisle = items.aisle;
	const secret = items.secret;
	const client = new faunadb.Client({
		secret: secret
	});

	const products = client
		.query(q.Paginate(q.Match(q.Index('product_by_name'), [ogname])))
		.then((ret) => {
			let collection = String(ret.data[0]).split('"')[1];
			let id = String(ret.data[0]).split('"')[3];

			client
				.query(
					q.Update(q.Ref(q.Collection(collection), id), {
						data: {
							name: name,
							price: price,
							rebate: rebate,
							origin: origin,
							description: description,
							image: image,
							aisle: aisle
						}
					})
				)
				.then((ret) => {
					console.log(ret);
				});
			return ret;
		});

	return {
		body: await products
	};
}
