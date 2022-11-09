const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

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

// token veryfy
function tokenVerify(req, res, next) {}

async function run() {
  // database and collection
  const servicesCollection = client.db("service_review").collection("services");
  const storiesCollection = client.db("service_review").collection("stories");

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

    // Story Api
    app.get("/story", (req, res) => {
      const query = {};
      const cursor = storiesCollection.find(query);
      const stories = cursor.toArray();
      res.send(stories);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
