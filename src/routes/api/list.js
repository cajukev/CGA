import faunadb from 'faunadb'
const q = faunadb.query;
const client = new faunadb.Client({
  secret: 'fnAEPGcbctACRIQyJcww1pSFWkFEK6ooGuNwjkRN'
});

export async function get({ params }) {
  const products = client.query(q.Map(
    q.Paginate(q.Match(q.Index("all_products"))),
    q.Lambda((x) => q.Get(x))))
  .then(ret => {return ret})
  
  return {
    body: await products
  }
};