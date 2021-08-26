import faunadb from 'faunadb';

export async function post(request) {
	const q = faunadb.query;
	const items = JSON.parse(request.body);
	const id = items.id;
	const secret = items.secret;
	const client = new faunadb.Client({
		secret: secret
	});

	const products = client
  .query(
    q.Delete(q.Ref(q.Collection("orders"), id))
  )
  .then((ret) => {
    console.log(ret);
    return ret
  });

	return {
		body: await products
	};
}
