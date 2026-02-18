const mongoose = require('mongoose');
const uri = "mongodb+srv://myhostel:23-Sep-06@notes.egwneyv.mongodb.net/cleancity?appName=notes";

console.log("Attempting to connect to MongoDB...");
mongoose.connect(uri)
    .then(() => {
        console.log("Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
