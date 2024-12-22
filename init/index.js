const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust_new";

main().then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log(err);
})
async function main()
{
    await mongoose.connect(mongo_url);
}

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
    ...obj,
    owner:"6766e69658d924987ddf7cbb",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();

