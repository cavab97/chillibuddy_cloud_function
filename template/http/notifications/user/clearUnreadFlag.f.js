const functions = require('firebase-functions');
const admin = require("firebase-admin");


const db = admin.firestore();

/*
    GENERATE WINNER FOR THE EVENT
*/

export default functions.https.onRequest(async(req, res) => {

    const userIdToken   = req.headers.authorization.split('Bearer')[1];

    // Validate User Identity
    const userUid       = await admin.auth().verifyIdToken(userIdToken).then( decodedToken => {
                                return decodedToken.uid;
                            }).catch(error => { throw error });
    
    const userRef       = db.collection("users").doc(userUid)

    return userRef.set({

        unreadNotification : 0

    },{merge : true}).then( () => {

        console.log("UserUid : " + userUid + "Read Notification List")

        return res.status(200).json(
            JSON.stringify({ 
                status : "Success",  
                action : "Clear Notification Unread Flag",
                message :`User ID : [${userUid}] Clear Notification Unread Flag Successfully.`,
            })
            )
    }).catch((error)=>{

        console.log("User ID : [" + userUid + "] Clear Notification Unread Flag Error :" + error)

        res.status(500).json(
            JSON.stringify({ 
                status : "Failure",  
                action : "Clear Notification Unread Flag",
                message :`User ID : [${userUid}] Clear Notification Unread Flag Error : ${error}`,
            }))
    })
});
