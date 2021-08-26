import faunadb from 'faunadb';


export async function post(request) {
	const q = faunadb.query;
  const items = JSON.parse(request.body);
	if(items.secret == 'admin'){
		const secret = import.meta.env.VITE_FAUNA_ADMIN
	}else{
		const secret = items.secret;
	}
  const email = items.email;
  const password = items.password;
  
	const client = new faunadb.Client({
		secret: secret
	});

	const newuser = client
		.query(
			q.Create(q.Collection("users"), {
        data: {
          email: email
        },
        credentials: {
          password: password
        }
      })
		)
		.then((ret) => {
			return ret;
		})


	return {
		body: await newuser
	};
}
