const admin = require("firebase-admin");

const db = admin.firestore();

// req - request, res - respond xxx.com/users
// https://us-central1-gogogain-gogogain.cloudfunctions.net/merchants/
exports.getAllMerchants = function (req, res) {

    let merchants = [];

    db.collection("merchants").get().then(querySnapshot => {

        //query to get documents only without firestore header
        querySnapshot.forEach(documentSnapshot => {
            merchants.push(documentSnapshot.data()); 
        })

        //return firestore console log success
        console.log("--- Operation Success ---")

        //return json data
        return Promise.resolve(res.status(200).json(merchants));

    }).catch(err => { 

        //return firestore console log failure
        console.log("--- Operation Failure ---")

        //return json failure
        return Promise.resolve(res.status(500).json(err));
    });
}; 

// get particular user id xxx.com/users/{userId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/merchants/KZDjNNhPXbDZLbGe3aHN
exports.getMerchant = function (req, res) {
    //user input id 
    const merchantId = req.params.merchantId;
    
    db.collection("merchants").doc(merchantId).get().then(merchant => {
        if(!merchant.exists) throw new Error('User does not exist');
        console.log("--- Operation Success ---")
        return Promise.resolve(res.status(200).json(merchant.data()));
    }).catch(err => { 
        console.log("--- Operation Failure ---")
        return Promise.resolve(res.status(500).json(err));
    });
}; 
