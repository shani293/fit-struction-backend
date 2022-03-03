var MongoClient = require('mongodb').MongoClient;
function connectionDatabase() {
    return new Promise((resolve, reject) => {
        let url= process.env.DB;
        MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async(err, client) => {
            if (err) {
                reject(err);
            } else {
                console.log('Database Connected!');
                const db = client.db('fit-struction');
                resolve(db);
            }
        });
    });
}
module.exports = connectionDatabase();