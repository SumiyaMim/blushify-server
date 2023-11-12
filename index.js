const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ory7ytz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db('productDB').collection('products');
    const cartCollection = client.db('productDB').collection('cart');

    // send products
    app.post('/products', async (req, res) => {
        const newProduct = req.body;
        // console.log(newProduct);
        const result = await productCollection.insertOne(newProduct);
        console.log(result)
        res.send(result);
    })

    // get products
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // get products
    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    // updates products
    app.put('/products/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedProduct = req.body;

      const product = {
          $set: {
              name: updatedProduct.name, 
              brand: updatedProduct.brand, 
              image: updatedProduct.image, 
              type: updatedProduct.type, 
              price: updatedProduct.price, 
              rating: updatedProduct.rating, 
              desc: updatedProduct.desc,
          }
      }
      const result = await productCollection.updateOne(filter, product, options);
      res.send(result);
    })

    // send cart details
    app.post('/cart', async (req, res) => {
      const newCartProduct = req.body;
      // console.log(newCartProduct);
      const result = await cartCollection.insertOne(newCartProduct);
      res.send(result);
    })

    // get cart details
    app.get('/cart', async (req, res) => {
      const cursor = cartCollection.find();
      const cart = await cursor.toArray();
      res.send(cart);
    })

    // delete product from cart
    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Blushify server is running')
})

app.listen(port, () => {
    console.log(`Blushify is running on port: ${port}`)
})