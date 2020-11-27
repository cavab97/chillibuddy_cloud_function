const admin = require("firebase-admin");

const db = admin.firestore();

// xxx.com/events/updateJoin/{eventId}/{userId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/events/updateJoin/SROcH39UP1TLzja7IV9t/tYCBQUalr1bFzmy0Beyz6h2GOd62
/* exports.updateJoin = async function (req, res) {

    const eventId = req.params.eventId;   
    const userId = req.params.userId;

    let eventRef = db.collection("events").doc(eventId);
    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);
    let publicEventRef = db.collection("publicEvent").doc(eventId);

    let batch = db.batch();

    await eventRef.collection("joined").doc(userId).get().then( doc => {

        if (!doc.exists) {

            let eventJoin = eventRef.collection("joined").doc(userId);
            batch.set(eventJoin, {
                uid: userId, 
                createAt: admin.firestore.Timestamp.now()
            });

            batch.update(eventRef, {
                numJoined: admin.firestore.FieldValue.increment(1)
            });

            let userJoin = userRef.collection("joined").doc(eventId);
            batch.set(userJoin, {
                uid: eventId, 
                createAt: admin.firestore.Timestamp.now()
            })

            let publicEventJoin = publicEventRef.collection("joined").doc(userId)
            batch.set(publicEventJoin, {
                uid: userId, 
                createAt: admin.firestore.Timestamp.now()
            })

            batch.update(publicEventRef, {
                numJoined: admin.firestore.FieldValue.increment(1)
            })

            let publicUserJoin =  publicUserRef.collection("joined").doc(eventId)
            batch.set(publicUserJoin, {
                uid: eventId, 
                createAt: admin.firestore.Timestamp.now()
            })

            batch.commit();

            console.log("--- Operation Success ---");
            return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "join" }));

        } else {

            console.log("User already join the event");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "join" }));

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "join", "errorMessage" : err }));

    });
};  */

// xxx.com/events/removeJoin/{eventId}/{userId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/events/removeJoin/SROcH39UP1TLzja7IV9t/tYCBQUalr1bFzmy0Beyz6h2GOd62
/* exports.removeJoin = async function (req, res) {

    const eventId = req.params.eventId;   
    const userId = req.params.userId;

    let eventRef = db.collection("events").doc(eventId);
    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);
    let publicEventRef = db.collection("publicEvent").doc(eventId);

    let batch = db.batch();

    await eventRef.collection("joined").doc(userId).get().then( doc => {

        if (doc.exists) {

            let eventJoin = eventRef.collection("joined").doc(userId);
            batch.delete(eventJoin);

            batch.update(eventRef, {
                numJoined: admin.firestore.FieldValue.increment(-1)
            });

            let userSubscribe = userRef.collection("joined").doc(eventId);
            batch.delete(userSubscribe);

            let publicEventJoin = publicEventRef.collection("joined").doc(userId);
            batch.delete(publicEventJoin);

            batch.update(publicEventRef, {
                numJoined: admin.firestore.FieldValue.increment(-1)
            })

            let publicUserJoin = publicUserRef.collection("joined").doc(eventId);
            batch.delete(publicUserJoin);

            batch.commit();

            console.log("--- Operation Success ---");
            return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "unjoin" }));

        } else {

            console.log("User not joining the event");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "unjoin" }));

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "unjoin", "errorMessage" : err }));

    });
};  */

/*  
    CREATE EVENT FUNCTION
    1. Create Event document and Public Event document
    2. Create Collection for Prize List and generate prizes according to amount

    Changes:
    1. Prizes 
        - Create collection prizes to generate prize ID in conjunction with amount of prizes amount receive
    2. Merchant
        - Merchant cannot create event for shop as we need to retrieve information
*/ 
exports.create = async function (req, res){

    let userID;
    let prizeRef;
    let userData;
    let shopData;
    let eventData = req.body;
    let prizeData = eventData.prizes;
    let batch = db.batch();
    let token = req.headers.authorization.split('Bearer')[1];

    let eventRef = db.collection("events").doc();
    //console.log(token)
   
    await admin.auth().verifyIdToken(token).then( decodedToken => {
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Create event",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    await db.collection("users").doc(userID).get().then( doc => {
        userData = doc.data();
        return userData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Create event",
            "message" : "User information not found"
        })
    });

    if (eventData.organizer === "gogogain") {
        await db.collection("gogogain").doc("profile").get().then( doc => {
            shopData = doc.data();
            return shopData;
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ 
                "status" : "Failure",  
                "action" : "Create event",
                "message" : "GoGoGain information not found"
            })
        });
    } else {
        if (userData.shopID !== "") {
            await db.collection("shops").doc(userData.shopID).get().then( doc => {
                shopData = doc.data();
                return shopData;
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ 
                    "status" : "Failure",  
                    "action" : "Create event",
                    "message" : "Shop information not found"
                })
            });
        } else {
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Create event",
                "message" : "Merchant cannot create event for shops"
            });
        }
    }

    if (userData.role !== "2skk7Y5JQSR2rPtVMtWk" && userData.shopID === eventData.shopID){
        //console.log(userData);
        if (eventData.startDate < eventData.endDate && eventData.announcementDate > eventData.endDate){
            batch.set(eventRef, {
                key: eventRef.id ? eventRef.id : '', 
                title: eventData.title ? eventData.title : '',
                coverPic: eventData.coverPic ? eventData.coverPic : '',
                createAt: admin.firestore.Timestamp.now(),
                created: {
                    by: userData.uid ? userData.uid : '',
                    time: admin.firestore.Timestamp.now(),
                },
                eventType: 'luckyDraw',
                deleted_at: null,
                announced: false,
                description: eventData.description ? eventData.description : '',
                shortDescription: eventData.shortDescription ? eventData.shortDescription : '',
                notificationTitle: eventData.notificationTitle?eventData.notificationTitle:'',
                notificationBody: eventData.notificationBody?eventData.notificationBody:'',
                notificationIosSubtitle: eventData.notificationIosSubtitle?eventData.notificationIosSubtitle:'',
                points: eventData.points ? Number(eventData.points) : 0,
                endDate: eventData.endDate ? new Date(eventData.endDate) : new Date.now(),
                announcementDate: eventData.announcementDate ? new Date(eventData.announcementDate) : new Date.now(),
                numOfTickets: 0,
                numOfParticipants:0,
                logo: shopData.logo ? shopData.logo : '',//shop
                displayName: shopData.displayName ? shopData.displayName : '',//shop
                name: shopData.name ? shopData.name : '',//shop
                phone: shopData.phone ? shopData.phone : '',//shop
                address: shopData.address ? shopData.address 
                : { country:'',
                    line1:'',
                    line2:'',
                    postcode:'',
                    states:''
                }, //shop
                shopID: eventData.shopID ? eventData.shopID : '',
                startDate: eventData.startDate ? new Date(eventData.startDate) : new Date.now(),
                subImage: eventData.subImage ? eventData.subImage : ['','','',''],
                termAndCon: eventData.termAndCon ? eventData.termAndCon : '',
                prizes: eventData.prizes ? [{
                    amount: Number(prizeData[0].amount),
                    item: prizeData[0].item,
                    type: prizeData[0].type,
                },{
                    amount: Number(prizeData[1].amount),
                    item: prizeData[1].item,
                    type: prizeData[1].type, 
                },{
                    amount: Number(prizeData[2].amount),
                    item: prizeData[2].item,
                    type: prizeData[2].type, 
                },{
                    amount: Number(prizeData[3].amount),
                    item: prizeData[3].item,
                    type: prizeData[3].type, 
                }
                ]
                : [{
                    amount: 0,
                    item: "",
                    type: "1stPrize",
                },
                {
                    amount: 0,
                    item: "",
                    type: "2ndPrize",
                },
                {
                    amount: 0,
                    item: "",
                    type: "3rdPrize",
                },
                {
                    amount: 0,
                    item: "",
                    type: "Consolation Prize",
                },
                ],
                organizer: eventData.organizer ? eventData.organizer : '',
                numJoined: eventData.numJoined ? eventData.numJoined : 0,
                redeemProcedure: eventData.redeemProcedure ? eventData.redeemProcedure : ''
            });

            let publicEventRef = db.collection("publicEvent").doc(eventRef.id);

            for(let i=0; i<Number(prizeData[0].amount); i++){
                prizeRef = db.collection("events").doc(eventRef.id).collection("prizes").doc();

                batch.set(prizeRef, {
                    ticketID: "",
                    uid: "",
                    name: "",
                    item: prizeData[0].item,
                    type: prizeData[0].type,
                    redeem: false,
                    redeemTime: null
                });
            }

            for(let j=0; j<Number(prizeData[1].amount); j++){
                prizeRef = db.collection("events").doc(eventRef.id).collection("prizes").doc();

                batch.set(prizeRef, {
                    ticketID: "",
                    uid: "",
                    name: "",
                    item: prizeData[1].item,
                    type: prizeData[1].type,
                    redeem: false,
                    redeemTime: null
                });
            }

            for(let k=0; k<Number(prizeData[2].amount); k++){
                prizeRef = db.collection("events").doc(eventRef.id).collection("prizes").doc();

                batch.set(prizeRef, {
                    ticketID: "",
                    uid: "",
                    name: "",
                    item: prizeData[2].item,
                    type: prizeData[2].type,
                    redeem: false,
                    redeemTime: null
                });
            }

            for(let l=0; l<Number(prizeData[3].amount); l++){
                prizeRef = db.collection("events").doc(eventRef.id).collection("prizes").doc();

                batch.set(prizeRef, {
                    ticketID: "",
                    uid: "",
                    name: "",
                    item: prizeData[3].item,
                    type: prizeData[3].type,
                    redeem: false,
                    redeemTime: null
                });
            }

            batch.set(publicEventRef, {
                title: eventData.title ? eventData.title : '',
                coverPic: eventData.coverPic ? eventData.coverPic : '',
                createAt: admin.firestore.Timestamp.now(),
                created: {
                    by: userData.uid ? userData.uid : '',
                    time: admin.firestore.Timestamp.now(),
                },
                deleted_at: null,
                eventType: 'luckyDraw',
                announced: false,
                description: eventData.description ? eventData.description : '',
                shortDescription: eventData.shortDescription ? eventData.shortDescription : '',
                notificationTitle: eventData.notificationTitle?eventData.notificationTitle:'',
                notificationBody: eventData.notificationBody?eventData.notificationBody:'',
                notificationIosSubtitle: eventData.notificationIosSubtitle?eventData.notificationIosSubtitle:'',
                points: eventData.points ? eventData.points : 0,
                endDate: eventData.endDate ? new Date(eventData.endDate) : new Date.now(),
                announcementDate: eventData.announcementDate ? new Date(eventData.announcementDate) : new Date.now(),
                numOfTickets: 0,
                numOfParticipants:0,
                logo: shopData.logo ? shopData.logo : '',//shop
                displayName: shopData.displayName ? shopData.displayName : '',//shop
                name: shopData.name ? shopData.name : '',//shop
                phone: shopData.phone ? shopData.phone : '',//shop
                address: shopData.address ? shopData.address : { 
                    country:'',
                    line1:'',
                    line2:'',
                    postcode:'',
                    states:''
                }, //shop
                shopID: eventData.shopID ? eventData.shopID : '',
                startDate: eventData.startDate ? new Date(eventData.startDate) : new Date.now(),
                subImage: eventData.subImage ? eventData.subImage : ['','','',''],
                termAndCon: eventData.termAndCon ? eventData.termAndCon : '',
                prizes: eventData.prizes ? [{
                    amount: Number(prizeData[0].amount),
                    item: prizeData[0].item,
                    type: prizeData[0].type,
                },{
                    amount: Number(prizeData[1].amount),
                    item: prizeData[1].item,
                    type: prizeData[1].type, 
                },{
                    amount: Number(prizeData[2].amount),
                    item: prizeData[2].item,
                    type: prizeData[2].type, 
                },{
                    amount: Number(prizeData[3].amount),
                    item: prizeData[3].item,
                    type: prizeData[3].type, 
                }
                ]
                : [{
                    amount: 0,
                    item: "",
                    type: "1st Prize",
                },
                {
                    amount: 0,
                    item: "",
                    type: "2ndPrize",
                },
                {
                    amount: 0,
                    item: "",
                    type: "3rdPrize",
                },
                {
                    amount: 0,
                    item: "",
                    type: "Consolation Prize",
                },    
                ],
                organizer: eventData.organizer ? eventData.organizer : '',
                numJoined: eventData.numJoined ? eventData.numJoined : 0,
                redeemProcedure: eventData.redeemProcedure ? eventData.redeemProcedure : ''
            });
            
            batch.commit().then(() => {
                console.log('Create event successfully');
                return res.status(200).json({ 
                    "status" : "Success",  
                    "action" : "Create event",
                    "message" : "Create event successfully"
                });
            }).catch(err => {
                console.log(err);
                return res.status(500).json({
                    "status" : "Failure",
                    "action" : "Create event",
                    "message" : "Failed to create event"
                });
            });
        } else {
            return res.status(500).json({ 
                "status" : "Failure",  
                "action" : "Create event",
                "message" : "START date must be earlier than END date / ANNOUNCEMENT date must be after END date"
            });
        }
    } else {
        return res.status(401).json({ 
            "status" : "Failure",  
            "action" : "Create event",
            "message" : "Unauthorized user access"
        });
    }
};

// Update Event
exports.update = async function (req, res){

    let userID;
    let userData;
    let shopData;
    let eventData = req.body;
    let batch = db.batch();
    let token = req.headers.authorization.split('Bearer')[1];
   
    //console.log(token)
   
    await admin.auth().verifyIdToken(token).then( decodedToken => {
        //console.log(decodedToken);
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Update event",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    await db.collection("users").doc(userID).get().then( doc => {
        userData = doc.data();
        //console.log(userData);
        return userData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Update event",
            "message" : "User information not found"
        })
    });

    if (eventData.organizer === "gogogain"){
        await db.collection("gogogain").doc("profile").get().then( doc => {
            shopData = doc.data();
            //console.log(userData);
            return shopData;
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ 
                "status" : "Failure",  
                "action" : "Update event",
                "message" : "GoGoGain information not found"
            })
        });
    } else {
        await db.collection("shops").doc(userData.shopID).get().then( doc => {
            shopData = doc.data();
            //console.log(userData);
            return shopData;
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ 
                "status" : "Failure",  
                "action" : "Update event",
                "message" : "Shop information not found"
            })
        });
    }

    if (userData.role !== "2skk7Y5JQSR2rPtVMtWk" && userData.shopID === eventData.shopID){
        //console.log(userData);
        let eventRef = db.collection("events").doc(eventData.key);
        
        batch.update(eventRef, {
            key: eventData.key ? eventData.key : '', 
            title: eventData.title ? eventData.title : '',
            coverPic: eventData.coverPic ? eventData.coverPic : '',
            createAt: admin.firestore.Timestamp.now(),
            created: {
                by: userData.uid ? userData.uid : '',
                time: admin.firestore.Timestamp.now(),
            },
            deleted_at: null,
            description: eventData.description ? eventData.description : '',
            shortDescription: eventData.shortDescription ? eventData.shortDescription : '',
            //points: eventData.points ? eventData.points : 0,
            //endDate: eventData.endDate ? new Date(eventData.endDate) : '',
            logo: shopData.logo ? shopData.logo : '',//shop
            displayName: shopData.displayName ? shopData.displayName : '',//shop
            name: shopData.name ? shopData.name : '',//shop
            //announcementDate: 
            //shopID: eventData.shopID ? eventData.shopID : '',
            //startDate: eventData.startDate ? new Date(eventData.startDate) : '',
            subImage: eventData.subImage ? eventData.subImage : ['','','',''],
            termAndCon: eventData.termAndCon ? eventData.termAndCon : '',
            //prizes: eventData.prizes ? eventData.prizes : [{}],
            //organizer: eventData.organizer ? eventData.organizer : '',
            numJoined: eventData.numJoined ? eventData.numJoined : 0,
            redeemProcedure: eventData.redeemProcedure ? eventData.redeemProcedure : ''
        });

        let publicEventRef = db.collection("publicEvent").doc(eventData.key);

        batch.update(publicEventRef, {
            title: eventData.title ? eventData.title : '',
            coverPic: eventData.coverPic ? eventData.coverPic : '',
            createAt: admin.firestore.Timestamp.now(),
            created: {
                by: userData.uid ? userData.uid : '',
                time: admin.firestore.Timestamp.now(),
            },
            deleted_at: null,
            description: eventData.description ? eventData.description : '',
            shortDescription: eventData.shortDescription ? eventData.shortDescription : '',
            //points: eventData.points ? eventData.points : 0,
            //endDate: eventData.endDate ? new Date(eventData.endDate) : '',
            logo: shopData.logo ? shopData.logo : '',//shop
            displayName: shopData.displayName ? shopData.displayName : '',//shop
            name: shopData.name ? shopData.name : '',//shop
            //shopID: eventData.shopID ? eventData.shopID : '',
            //startDate: eventData.startDate ? new Date(eventData.startDate) : '',
            subImage: eventData.subImage ? eventData.subImage : ['','','',''],
            termAndCon: eventData.termAndCon ? eventData.termAndCon : '',
            //prizes: eventData.prizes ? eventData.prizes : [{}],
            //organizer: eventData.organizer ? eventData.organizer : '',
            numJoined: eventData.numJoined ? eventData.numJoined : 0,
            redeemProcedure: eventData.redeemProcedure ? eventData.redeemProcedure : ''
        });
        
        batch.commit().then(() => {
            console.log('Update event successfully');
            return res.status(200).json({ 
                "status" : "Success",  
                "action" : "Update event",
                "message" : "Update event successfully"
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Update event",
                "message" : "Failed to update event"
            });
        });

    } else {
        return res.status(401).json({ 
            "status" : "Failure",  
            "action" : "Update event",
            "message" : "Unauthorized user access"
        })
    }
};

// Delete Event
exports.delete = async function (req, res){

    let userID;
    let userData;
    let eventData = req.body;
    let batch = db.batch();
    let token = req.headers.authorization.split('Bearer')[1];
   
    //console.log(token)
   
    await admin.auth().verifyIdToken(token).then( decodedToken => {
        //console.log(decodedToken);
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Delete event",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    await db.collection("users").doc(userID).get().then( doc => {
        userData = doc.data();
        //console.log(userData);
        return userData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Delete event",
            "message" : "User information not found"
        })
    });

    if (userData.role !== "2skk7Y5JQSR2rPtVMtWk" && userData.shopID === eventData.shopID){
        //console.log(userData);
        let eventRef = db.collection("events").doc(eventData.key);
        
        batch.update(eventRef, {
            deleted_at: admin.firestore.Timestamp.now(),
        });

        let publicEventRef = db.collection("publicEvent").doc(eventData.key);

        batch.update(publicEventRef, {
            deleted_at: admin.firestore.Timestamp.now(),
        });
        
        batch.commit().then(() => {
            console.log('Delete event successfully');
            return res.status(200).json({ 
                "status" : "Success",  
                "action" : "Delete event",
                "message" : "Delete event successfully"
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Delete event",
                "message" : "Failed to delete event"
            });
        });

    } else {
        return res.status(401).json({ 
            "status" : "Failure",  
            "action" : "Delete event",
            "message" : "Unauthorized user access"
        })
    }
};

// Restore Event
exports.restore = async function (req, res){

    let userID;
    let userData;
    let eventData = req.body;
    let batch = db.batch();
    let token = req.headers.authorization.split('Bearer')[1];
   
    //console.log(token)
   
    await admin.auth().verifyIdToken(token).then( decodedToken => {
        //console.log(decodedToken);
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Restore event",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    await db.collection("users").doc(userID).get().then( doc => {
        userData = doc.data();
        //console.log(userData);
        return userData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Restore event",
            "message" : "User information not found"
        })
    });

    if (userData.role !== "2skk7Y5JQSR2rPtVMtWk" && userData.shopID === eventData.shopID){
        //console.log(userData);
        let eventRef = db.collection("events").doc(eventData.key);
        
        batch.update(eventRef, {
            deleted_at: null,
        });

        let publicEventRef = db.collection("publicEvent").doc(eventData.key);

        batch.update(publicEventRef, {
            deleted_at: null,
        });
        
        batch.commit().then(() => {
            console.log('Delete event successfully');
            return res.status(200).json({ 
                "status" : "Success",  
                "action" : "Restore event",
                "message" : "Restore event successfully"
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Restore event",
                "message" : "Failed to restore event"
            });
        });

    } else {
        return res.status(401).json({ 
            "status" : "Failure",  
            "action" : "Restore event",
            "message" : "Unauthorized user access"
        })
    }
};

exports.join = async function (req, res) {

    /*  
    Event Collection        - Ticket Collection - each Ticket with unique ID - uid, createAt, name, win, redeemed
                            - numOfTickets increment "numOfTickets"
                            - 
    PublicEvent Collection  - numOfTickets increment "numOfTickets"
    Users Collection        - events Collection - eventID   - TicketCollections - eventID,createAt,eventName, win, redeemed
    ***                                                     - Event Details, numOfTickets increment "numOfTickets" 
                            - points collection - balance   - points reduce points cost
                            - points reduce points cost
    gogogain                - points collection - balance   - points increase points cost
                            - points increase points cost   
    ***   Transaction
    
    */ 

    //var
    const time = admin.firestore.Timestamp.now();
    let eventID = req.body.eventID;   
    let numOfTickets = req.body.numOfTickets;
    let userID;
    let userData;
    let eventData;
    let total;
    let ticketID = [];
    let ID;
    const token = req.headers.authorization.split('Bearer')[1];

    await admin.auth().verifyIdToken(token).then( decodedToken => {
        //console.log(decodedToken);
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log('verifyIdToken :' + err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Join",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    //Database ref
    const userRef = db.collection("users").doc(userID);
    const eventRef = db.collection("events").doc(eventID);
    const publicEventJoin = db.collection("publicEvent").doc(eventID);

    const eventParticipantRef = eventRef.collection('participants');

    const userJoin = db.collection("users").doc(userID).collection("events").doc(eventID);
    const userPoint = db.collection("users").doc(userID).collection("points").doc("balance");

    const gogogainRef = db.collection("gogogain").doc('points');
    const gogogainPoint = db.collection("gogogain").doc('points').collection("points").doc("balance");

    return db.runTransaction((transaction) =>{
        return transaction.getAll(userRef,eventRef,userJoin)
            .then((data)=>{
                
                userData = data[0].data();
                eventData = data[1].data();

                const isNewParticipant = !data[2].exists;

                total = eventData.points * numOfTickets;

                if (!(data[0].exists && data[1].exists)) {
                    console.log('Data Exist :' + !(data[0].exists && data[1].exists))
                    return res.status(500).json({ 
                        "status" : "Failure",  
                        "action" : "Join",
                        "message" : "Information not found"
                    })
                }

                if(userData.points < total){
                    console.log('User does not have enough points')
                    return res.status(500).json({ 
                        "status" : "Failure",  
                        "action" : "Join",
                        "message" : "User does not have enough points"
                    })
                }

                for(let i=0; i<numOfTickets; i++){
                    let eventTickets = db.collection("events").doc(eventID).collection("tickets").doc();
                    let userTickets = db.collection("users").doc(userID).collection("events").doc(eventID).collection("tickets").doc(eventTickets.id);
                    const createAt = time;
                    transaction.set(eventTickets, {
                        uid: userID, 
                        name: userData.name,
                        createAt: createAt,
                        win:false,
                        redeemed:false,
                    });
                    transaction.set(userTickets, {
                        eventID: eventID, 
                        name: eventData.title,
                        createAt: createAt,
                        win:false,
                        redeemed:false,
                    });
                    ticketID.push(eventTickets.id);
                }

                transaction.update(eventRef, {
                    numOfTickets: admin.firestore.FieldValue.increment(numOfTickets)
                });
                transaction.update(publicEventJoin, {
                    numOfTickets: admin.firestore.FieldValue.increment(numOfTickets)
                });

                if(isNewParticipant)
                {
                    transaction.set(userJoin, { 
                        createAt: time,
                        name: eventData.name,
                        //tickets: ticketID,
                        deleted_at: eventData.deleted_at,
                        holdingTickets:numOfTickets,
                        numOfTickets:eventData.numOfTickets,
                        coverPic: eventData.coverPic,
                        title: eventData.title,
                        created: eventData.created,
                        description: eventData.description,
                        shortDescription: eventData.shortDescription,
                        points: eventData.points,
                        endDate: eventData.endDate,
                        announcementDate: eventData.announcementDate,
                        logo: eventData.logo,
                        displayName: eventData.displayName,
                        phone: eventData.phone,
                        address: eventData.address,
                        shopID: eventData.shopID,
                        startDate: eventData.startDate,
                        subImage: eventData.subImage,
                        termAndCon: eventData.termAndCon,
                        prizes: eventData.prizes,
                        organizer: eventData.organizer,
                        numJoined: eventData.numJoined,
                        redeemProcedure: eventData.redeemProcedure
                        },{merge:true})

                    transaction.set(eventParticipantRef.doc(userID),{
                        holdingTickets:numOfTickets,
                        username: userData.name,
                        uid:userID,
                        createAt: time,
                    })    

                    transaction.update(eventRef,{
                        numOfParticipants:admin.firestore.FieldValue.increment(1),
                    })  

                }else{
                    transaction.update(userJoin, {         
                        holdingTickets:admin.firestore.FieldValue.increment(numOfTickets),
                        numOfTickets:eventData.numOfTickets + numOfTickets,
                    })
                    transaction.update(eventParticipantRef.doc(userID),{
                        holdingTickets:admin.firestore.FieldValue.increment(numOfTickets),
                    })    
                }

                const senderTransactionRef = userRef.collection("transactions").doc();
                const receiverTransactionRef = gogogainRef.collection("transactions").doc(senderTransactionRef.id)
                
                
                transaction.set(senderTransactionRef, {
                    id: "gogogain",
                    type: "gogogain",
                    amount: 0,
                    points: -total,
                    username: "GoGoGain Official",
                    createAt: time,
                    eventID: eventID,
                    numOfTickets: numOfTickets,
                    ticketID
                });

                transaction.set(receiverTransactionRef, {
                    id: userID,
                    type: "user",
                    amount: 0,
                    points: total,
                    username: userData.name,
                    createAt: time,
                    eventID: eventID,
                    numOfTickets: numOfTickets,
                    ticketID
                });
 
                transaction.update(userPoint, {
                    points: admin.firestore.FieldValue.increment(-total)
                });
        
                transaction.update(userRef, {
                    points: admin.firestore.FieldValue.increment(-total)
                });
        
                transaction.update(gogogainRef, {
                    points: admin.firestore.FieldValue.increment(total)
                });
        
                transaction.update(gogogainPoint, {
                    points: admin.firestore.FieldValue.increment(total)
                });
                return null
            }).catch((error)=>{
                console.log('Transaction Set Error :' +error)
                return res.status(500).json({ 
                    "status" : "Failure",  
                    "action" : "Join",
                    "message" : "Information not found"
                })
            })
    })
        .then(()=>{
            console.log('Join event successfully');
            return res.status(200).json({ 
                "status" : "Success",  
                "action" : "Join",
                "message" : "Join event successfully",
                "balance" : `${userData.points - total}`
            });
        })
        .catch((error)=>{
            console.log('Transaction Error :' +error);
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Join",
                "message" : "Something went wrong, failed to join event"
            });
        })

    // await db.collection("users").doc(userID).get().then( doc => {
    //     userData = doc.data();
    //     // console.log(userData);
    //     return userData;
    // }).catch(err => {
    //     console.log(err)
    //     return res.status(500).json({ 
    //         "status" : "Failure",  
    //         "action" : "Join",
    //         "message" : "User information not found"
    //     })
    // });

    // await db.collection("events").doc(eventID).get().then( doc => {
    //     eventData = doc.data();
    //     //console.log(eventData);
    //     return eventData;
    // }).catch(err => {
    //     console.log('events collection :' +err)
    //     return res.status(500).json({ 
    //         "status" : "Failure",  
    //         "action" : "Join",
    //         "message" : "Event information not found"
    //     })
    // });



    
    // total = eventData.points * numOfTickets;

    // if(userData.points >= total){
    //     for(let i=0; i<numOfTickets; i++){
    //         let eventTickets = db.collection("events").doc(eventID).collection("tickets").doc();
    //         let userTickets = db.collection("users").doc(userID).collection("events").doc(eventID).collection("tickets").doc(eventTickets.id);
    //         const createAt = admin.firestore.Timestamp.now();
    //         batch.set(eventTickets, {
    //             uid: userID, 
    //             name: userData.name,
    //             createAt: createAt,
    //             win:false,
    //             redeemed:false,
    //         });
    //         batch.set(userTickets, {
    //             eventID: eventID, 
    //             name: eventData.title,
    //             createAt: createAt,
    //             win:false,
    //             redeemed:false,
    //         });
    //         // ticketID.push(eventTickets.id);
    //     }

    //     batch.update(eventRef, {
    //         numOfTickets: admin.firestore.FieldValue.increment(numOfTickets)
    //     });
    //     batch.update(publicEventJoin, {
    //                 numOfTickets: admin.firestore.FieldValue.increment(numOfTickets)
    //     });
    //     // for(let j=0; j<numOfTickets; j++){
    //     //     let publicEventJoin = db.collection("publicEvent").doc(eventID).collection("tickets").doc(ticketID[j]);
    //     //     batch.set(publicEventJoin, {
    //     //         uid: userID, 
    //     //         name: userData.name,
    //     //         joinID: ticketID[j],
    //     //         createAt: admin.firestore.Timestamp.now()
    //     //     });
    //     // }

        

    //     batch.set(userJoin, { 
    //         createAt: admin.firestore.Timestamp.now(),
    //         name: eventData.name,
    //         tickets: ticketID,
    //         coverPic: eventData.coverPic,
    //         title: eventData.title,
    //         created: eventData.created,
    //         description: eventData.description,
    //         shortDescription: eventData.shortDescription,
    //         points: eventData.points,
    //         endDate: eventData.endDate,
    //         announcementDate: eventData.announcementDate,
    //         numOfTickets: eventData.numOfTickets,
    //         logo: eventData.logo,
    //         displayName: eventData.displayName,
    //         phone: eventData.phone,
    //         address: eventData.address,
    //         shopID: eventData.shopID,
    //         startDate: eventData.startDate,
    //         subImage: eventData.subImage,
    //         termAndCon: eventData.termAndCon,
    //         prizes: eventData.prizes,
    //         organizer: eventData.organizer,
    //         numJoined: eventData.numJoined,
    //         redeemProcedure: eventData.redeemProcedure
    //     });


    //     //ID = userJoin.id

    //     // let publicUserJoin = db.collection("publicUserProfile").doc(userID).collection("events").doc(ID);
    //     // batch.set(publicUserJoin, { 
    //     //     createAt: admin.firestore.Timestamp.now(),
    //     //     name: eventData.name,
    //     //     tickets: ticketID,
    //     //     coverPic: eventData.coverPic,
    //     //     title: eventData.title,
    //     //     created: eventData.created,
    //     //     description: eventData.description,
    //     //     shortDescription: eventData.shortDescription,
    //     //     points: eventData.points,
    //     //     endDate: eventData.endDate,
    //     //     announcementDate: eventData.announcementDate,
    //     //     numOfTickets: eventData.numOfTickets,
    //     //     logo: eventData.logo,
    //     //     displayName: eventData.displayName,
    //     //     phone: eventData.phone,
    //     //     address: eventData.address,
    //     //     shopID: eventData.shopID,
    //     //     startDate: eventData.startDate,
    //     //     subImage: eventData.subImage,
    //     //     termAndCon: eventData.termAndCon,
    //     //     prizes: eventData.prizes,
    //     //     organizer: eventData.organizer,
    //     //     numJoined: eventData.numJoined,
    //     //     redeemProcedure: eventData.redeemProcedure
    //     // });

    //     batch.update(userPoint, {
    //         points: admin.firestore.FieldValue.increment(-total)
    //     });

    //     batch.update(userRef, {
    //         points: admin.firestore.FieldValue.increment(-total)
    //     });

    //     batch.update(gogogainRef, {
    //         points: admin.firestore.FieldValue.increment(total)
    //     });

    //     batch.update(gogogainPoint, {
    //         points: admin.firestore.FieldValue.increment(total)
    //     });

    //     batch.commit().then(() => {
    //         console.log('Join event successfully');
    //         return res.status(200).json({ 
    //             "status" : "Success",  
    //             "action" : "Join",
    //             "message" : "Join event successfully"
    //         });
    //     }).catch(err => {
    //         console.log(err);
    //         return res.status(500).json({
    //             "status" : "Failure",
    //             "action" : "Join",
    //             "message" : "Failed to join event"
    //         });
    //     });

    // } else {
    //     return res.status(500).json({ 
    //         "status" : "Failure",  
    //         "action" : "Join",
    //         "message" : "User does not have enough points"
    //     })
    // }
}; 



