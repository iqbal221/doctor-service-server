const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is doctor service server");
});

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t4uwg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// token verify
function tokenVerify(req, res, next) {
  const authHeaders = req.headers.authorization;

  if (!authHeaders) {
    return res.status(401).send({ message: "Unauthorized user" });
  }
  const token = authHeaders.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_KEY_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized user" });
    }
    req.decoded = decoded;
    console.log(decoded);
    next();
  });
}

async function run() {
  // database and collection
  const servicesCollection = client.db("service_review").collection("services");
  const storiesCollection = client.db("service_review").collection("stories");
  const feedbackCollection = client.db("service_review").collection("feedback");

  try {
    // json web token api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_KEY_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // service api
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    app.get("/all_services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/all_services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = servicesCollection.find(query);
      const serviceDetails = await cursor.toArray();
      res.send(serviceDetails);
    });

    app.post("/all_services", tokenVerify, async (req, res) => {
      const query = req.body;
      const services = await servicesCollection.insertOne(query);
      res.send(services);
    });

    // Story Api
    app.get("/stories", async (req, res) => {
      const query = {};
      const cursor = storiesCollection.find(query);
      const stories = await cursor.toArray();
      res.send(stories);
    });

    // feedback api
    app.get("/feedback", async (req, res) => {
      const query = {};
      const cursor = feedbackCollection.find(query);
      const feedback = await cursor.toArray();
      res.send(feedback);
    });

    app.post("/feedback", tokenVerify, async (req, res) => {
      const query = req.body;
      const feedback = await feedbackCollection.insertOne(query);
      res.send(feedback);
    });

    app.patch("/feedback/:id", tokenVerify, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const feedback = req.body;
      const updateDocument = {
        $upsert: {
          status: feedback,
        },
      };
      const result = await feedbackCollection.updateOne(query, updateDocument);
      res.send(result);
    });

    app.delete("/feedback/:id", tokenVerify, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await feedbackCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
