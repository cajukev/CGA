import faunadb from 'faunadb';


export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
	const secret = items.secret;
  
	const client = new faunadb.Client({
		secret: secret
	});

	const users = client
		.query(
			q.Map(
				q.Paginate(q.Match(q.Index('all_users'))),
				q.Lambda((x) => q.Get(x))
			)
		)
		.then((ret) => {
			return ret;
		})


	return {
		body: await users
	};
}
