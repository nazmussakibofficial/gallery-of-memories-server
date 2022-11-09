const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yxjl2sj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    try {
        const serviceCollection = client.db('GoM').collection('services');
        const commentCollection = client.db('GoM').collection('comments');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.send({ token })
        })

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
        app.get('/comments', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'unauthorized access' })
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = commentCollection.find(query).sort({ "date": -1 });
            const comments = await cursor.toArray();
            res.send(comments);
        })

        app.post('/comments', async (req, res) => {
            const { service, serviceName, price, customer, email, photo, comment } = req.body;
            const result = await commentCollection.insertOne({ service, serviceName, price, customer, email, photo, comment, date: new Date() });
            res.send(result);
        })

        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: id };
            const cursor = commentCollection.find(query).sort({ "date": -1 })
            const comments = await cursor.toArray();
            res.send(comments);
        })

        app.patch('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const comment = req.body.comment;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    comment
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