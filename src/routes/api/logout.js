import faunadb, { Match, Login } from 'faunadb';


export async function post(req) {
	const items = JSON.parse(req.body);
	const q = faunadb.query;
	const adminSecret = import.meta.env.VITE_FAUNA_ADMIN;
	const client = new faunadb.Client({
		secret: items.secret
	});
	var type = 'no';
	const login = client
		.query(q.Logout(true))
		.catch((error) => {
			return error;
		})
		.then((ret) => {
			return ret;
		});
    return { ok: true };
}
