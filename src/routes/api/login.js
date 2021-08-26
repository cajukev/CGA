import faunadb, { Match, Login } from 'faunadb';

export async function post(req) {
	const items = JSON.parse(req.body);
	const q = faunadb.query;
	const adminSecret = import.meta.env.VITE_FAUNA_ADMIN;
	const client = new faunadb.Client({
		secret: adminSecret
	});
	var type = 'no';
	const login = client
		.query(q.Login(q.Match(q.Index('users_by_email'), items.email), { password: items.password }))
		.catch((error) => {
			return error;
		})
		.then((ret) => {
      if(!ret.requestResult){
        type = 'user'
			  return ret;
      }else{
        return false
      }
			
		});
	const login2 = client
		.query(
			q.Login(q.Match(q.Index('managers_by_email'), items.email), { password: items.password })
		)
		.catch((error) => {
			return error;
		})
		.then((ret) => {
			if(!ret.requestResult){
        type = 'manager'
			  return ret;
      }else{
        return false
      }
		});
    if(await login){
      console.log('user')
      return { body: { data: [await login,'user', items.email] } };
    }else{
      if(await login2){
        console.log('manager')
        return { body: { data: [await login2,'manager', items.email]} };
      }
    }
    
    return { ok: false };
}
