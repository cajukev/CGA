import faunadb from 'faunadb';


export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
	const secret = items.secret;
  const name = items.name;
  const price = items.price;
  const rebate = items.rebate;
  const origin = items.origin;
  const description = items.description;
  const image = items.image
  const aisle = items.aisle
  
	const client = new faunadb.Client({
		secret: secret
	});

	const newproduct = client
		.query(
			q.Create(q.Collection("products"), {
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
			return ret;
		})


	return {
		body: await newproduct
	};
}
