import faunadb from 'faunadb'
const q = faunadb.query;
const client = new faunadb.Client({
  secret: 'fnAEPGcbctACRIQyJcww1pSFWkFEK6ooGuNwjkRN'
});

export async function get({ params }) {
  const products = client.query(q.Paginate(q.Match(q.Index("all_products"))));
  if(products){
    return{
      body:{
        products
      }
    }
  }
  
};