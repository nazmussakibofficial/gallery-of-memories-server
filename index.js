const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yxjl2sj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('GoM').collection('services');
        const commentCollection = client.db('GoM').collection('comments');
        //services
        app.get('/home', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //comments
        app.get('/comments', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            res.send(comments);
        })

        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        })

        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: id };
            const cursor = commentCollection.find(query)
            const comments = await cursor.toArray();
            res.send(comments);
        })

        app.patch('/comemnts/:id', async (req, res) => {
            const id = req.params.id;
            const details = req.body.details;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    details: details
                }
            }
            const result = await commentCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await commentCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(e => console.error(e));

app.get('/', (req, res) => {
    res.send('Gallery of Memory server is running')
})

app.listen(port, () => {
    console.log(`Server is running on ${port} port`)
})