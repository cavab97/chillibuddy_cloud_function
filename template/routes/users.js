const admin = require("firebase-admin");

const db = admin.firestore();

/* exports.createPublicUser = function (req, res) {
    const user = req.body;
    console.log(user);

    let batch = db.batch();

    let userRef = db.collection('users').doc(); 
    let publicUserRef = db.collection('publicUserProfile').doc(); 

    await userRoleInfoRef.get().then( doc => {
        const exists = (doc.exists);
        if (exists) {
            roleData = doc.data();
            userRole = roleData.role;
            merchantID = roleData.merchantID;
            shopID = roleData.shopID
        }
        else
        {
            userRole = "2skk7Y5JQSR2rPtVMtWk";
            merchantID = "";
            shopID = "";
        }
        
        return roleData;
    }).catch(err => {
        //roleData = undefined;
        return console.log("error :" +err);
    })

    batch.set(publicUserRef, {
        avatar: docData.avatar ? docData.avatar:'',
        address: { 
            country: address.country ? address.country:'',
            postcode: address.postcode ? address.postcode:'',
            states: address.states ? address.states:'',
        },
        created_at: admin.firestore.Timestamp.now(),
        deleted_at: null,
        birthday: docData.birthday ? docData.birthday:'',
        email: docData.email ? docData.email:"",
        gender: docData.gender ? docData.gender:"",
        name: docData.name ? docData.name:"",
    });


    return res.status(200).json();
} */

// req - request, res - respond xxx.com/users
// https://us-central1-gogogain-gogogain.cloudfunctions.net/users/
/* exports.getAllUsers = function (req, res) {

    let users = [];

    db.collection("users").get().then(querySnapshot => {

        //query to get documents only without firestore header
        querySnapshot.forEach(documentSnapshot => {
            users.push(documentSnapshot.data()); 
        })

        //return firestore console log success
        console.log("--- Operation Success ---")

        //return json data
        return res.status(200).json(users);

    }).catch(err => { 

        //return firestore console log failure
        console.log("--- Operation Failure ---")

        //return json failure
        return res.status(500).json(err);
    });
}; 

// get particular user id xxx.com/users/{userId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/users/2t9FbrDF6XgeEJ475x3PhzLFZB82
exports.getUser = function (req, res) {
    //user input id 
    const userId = req.params.userId;
    
    db.collection("users").doc(userId).get().then(user => {
        if(!user.exists) throw new Error('User does not exist');
        console.log("--- Operation Success ---")
        return res.status(200).json(user.data());
    }).catch(err => { 
        console.log("--- Operation Failure ---")
        return res.status(500).json(err);
    });
}; 

exports.setUserRole = function (req, res) {

    const userId = req.params.userId;   
    const roleId = req.params.merchantId;
    //const merchantId = req.params.merchantId;
    //const shopId = req.params.shopId;
    
    let userRef = db.collection("users").doc(userId);
     
    let roleInfoRef = db.collection("users").doc(userId).collection("permission").doc("roleInfo");

    let batch = db.batch();
    
    userRef.get().then( doc => {
 
        if (doc.exists) {
            
            batch.set(roleInfoRef, {
                role: roleId,
                merchantId: "",
                shopId: "",
            });

            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "createRole" });

        } else {

            console.log("Cannot create role");
            return res.status(500).json({ "message" : "failure", "action" : "createRole" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "createRole", "errorMessage" : {err}});

    });
}; 
 */

