const express = require("express")
const body = require("body-parser")
const cors = require("cors")
const { MongoClient } = require("mongodb")
const app = express()

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

app.use(body.json())
app.use(body.urlencoded())
app.use(cors())

app.get("/history", async (req, res) => {
    await client.connect()
    const db = client.db("jigsaw-interview")
    const collection = db.collection('short-url')

    const result = await collection.find({}).toArray()

    res.json({ result })
})

app.get("*", async (req, res) => {
    const path = req.originalUrl.slice(1)

    await client.connect()
    const db = client.db("jigsaw-interview")
    const collection = db.collection('short-url')

    const result = await collection.findOne({ path })
    await collection.updateOne({ path }, { $inc: { view: +1 } })

    res.redirect(result.url)
})

app.post("/get-url", async (req, res) => {
    const url = req.body.url
    const path = makeid(5)

    await client.connect()
    const db = client.db("jigsaw-interview")
    const collection = db.collection('short-url')

    await collection.insertOne({ url, path, view: 0 })

    res.json({shortUrl: "http://localhost:1234/" + path})
})

app.listen(1234, function() {
    console.log("Node.js working ...")
})