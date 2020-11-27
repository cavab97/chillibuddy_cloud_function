const admin = require("firebase-admin");

const db = admin.firestore();

exports.createTransaction = async function (req, res) {
    //console.log("enter transaction");
    const senderId = req.params.senderId;   
    const senderType = req.params.senderType;
    const senderAmount = req.params.senderAmount;
    const senderPoint = req.params.senderPoint;
    let senderUsername;

    const receiverId = req.params.receiverId;   
    const receiverType = req.params.receiverType;
    const receiverAmount = req.params.senderAmount;
    const receiverPoint = req.params.senderPoint;
    const receiverUsername = req.params.receiverUsername;
 
    let senderRef;
    let receiverRef;

    let systemRef = db.collection("gogogain").doc("points").collection("points").doc("balance");
    let systemPoint;

    let batch = db.batch();
    let senderCurrentPoint;
    let receiverCurrentPoint;
    let pointTemp = 0;
    let systemPointTemp = 0;
    let numSenderAmount;
    let numReceiverAmount;

    if ( senderType === "users") {
        senderRef = db.collection("users").doc(senderId);
    } else if ( senderType === "shops") {
        senderRef = db.collection("shops").doc(senderId);
    } else {
        senderRref = db.collection("gogogain").doc(senderId);
    }
    //console.log(senderRef);

    if ( receiverType === "users") {
        receiverRef =  db.collection("users").doc(receiverId);
    } else if ( receiverType === "shops") {
        receiverRef = db.collection("shops").doc(receiverId);
    } else if ( receiverType === "gogogain") {
        receiverRef = db.collection("gogogain").doc(receiverId);
    }

    await senderRef.collection("points").doc("balance").get().then( doc => {
        senderCurrentPoint = doc.data();
        // console.log(doc.data())
        return senderCurrentPoint;
    }).catch(err => {
        return console.log(err);
    })

    await db.collection("gogogain").doc("points").collection("points").doc("balance").get().then( doc => {
        systemPoint = doc.data();
        // console.log(doc.data());
        return systemPoint;
    }).catch(err => {
        return console.log(err);
    })
    
    await receiverRef.collection("points").doc("balance").get().then( doc => {
        receiverCurrentPoint = doc.data();
        // console.log(doc.data());
        return receiverCurrentPoint;
    }).catch(err => {
        return console.log(err);
    })

    // console.log("going to get");

    senderRef.get().then( doc => {
        console.log(doc.exists)
        if(!isNaN(senderPoint) && !isNaN(senderAmount)){
            if (doc.exists) {

                let senderStringPoint = Number(senderPoint);
                let receiverStringPoint = Number(receiverPoint);
                numSenderAmount = Number(senderAmount);
                numReceiverAmount = Number(receiverAmount);
                // console.log(doc.data());
                senderData = doc.data();
                senderUsername = senderData.name;
                // console.log(receiverCurrentPoint.points);
                // console.log(senderCurrentPoint.points);
                // console.log(senderAmount)
                if (receiverCurrentPoint.points >= receiverPoint) {
                    //console.log("enter if function");
                    const receiverTransactionRef = receiverRef.collection("transactions").doc();
                    const senderTransactionRef = senderRef.collection("transactions").doc(receiverTransactionRef.id)
                    
                    batch.set(receiverTransactionRef, {
                        id: senderId,
                        type: senderType,
                        amount: numSenderAmount,
                        points: senderStringPoint,
                        username: senderUsername,
                        createAt: admin.firestore.Timestamp.now()
                    });
                    //console.log("add sender transaction");
                    // pointTemp = (senderCurrentPoint.points * 1) + (senderPoint * 1);
                    // console.log(pointTemp)
                    // batch.update(senderRef.collection("points").doc("balance"),{
                    //     points: pointTemp
                    // });
                    //console.log("set balance point");
                    /* if (senderType === "users") {
                        systemPointTemp = (systemPoint.points * 1) + (senderPoint * 1);
                        console.log(systemPointTemp)
                        batch.update(systemRef, {
                            points: systemPointTemp
                        });
                    } */
                    //console.log("set system point");
                    batch.set(senderTransactionRef, {
                        id: receiverId,
                        type: receiverType,
                        amount: numReceiverAmount,
                        points: receiverStringPoint,
                        username: receiverUsername,
                        createAt: admin.firestore.Timestamp.now()
                    });
                    //console.log("set receiver transaction");
                    
                    pointTemp = Number(receiverCurrentPoint.points) - Number(receiverPoint);
                    // console.log(pointTemp);
                    // console.log(receiverPoint);
                    // console.log(receiverCurrentPoint.points);
                    batch.update(receiverRef.collection("points").doc("balance"),{
                        points: pointTemp
                    })

                    batch.update(receiverRef,{
                        points: pointTemp
                    })

                    pointTemp = Number(senderCurrentPoint.points) + Number(receiverPoint);

                    batch.update(senderRef.collection("points").doc("balance"),{
                        points: pointTemp
                    })
                    
                    batch.update(senderRef,{
                        points: pointTemp
                    })
                    //console.log("set receiver points");
                    // if(senderType === "users"){
                    //     systemPointTemp = (systemPointTemp * 1) - (receiverPoint * 1);
                    //     //console.log(systemPointTemp);
                    //     batch.update(systemRef, {
                    //         points: systemPointTemp
                    //     });
                    // }     
                    //console.log("setsystem points");
                    batch.commit();

                    console.log("--- Operation Success ---");
                    return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "transaction" }));

                } else {
                    console.log("--- Operation Failure ---");
                    return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "transaction", "error" : "Insufficient Amount"}));
                }

            } else {

                console.log("User does not receiver does not exist");
                return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "transaction", "error" : "Receiver Not Found" }));

            }
            
        } else {
            console.log("Not number");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "transaction", "error" : "Point or Amount consist of non numerical" }));
        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "transaction", "errorMessage" : err }));

    });
}; 
