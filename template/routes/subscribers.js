const admin = require("firebase-admin");

const db = admin.firestore();

// xxx.com/subscribes/updateSubscribe/{shopId}/{userId}
//  https://us-central1-gogogain-gogogain.cloudfunctions.net/subscribes/updateSubscribe/pegxajbeieGa6l0gl2jt/tYCBQUalr1bFzmy0Beyz6h2GOd62
/* exports.updateSubscribe = async function (req, res) {

    const shopId = req.params.shopId;   
    const userId = req.params.userId;

    let shopRef = db.collection("shops").doc(shopId);
    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);
    let publicShopRef = db.collection("publicShopProfile").doc(shopId);

    let merchantData;
    let arrayData;

    let batch = db.batch();

    await shopRef.get().then( doc => {
        merchantData = doc.data();
        console.log(merchantData);
        return merchantData;
    }).catch(err => {
        return console.log(err);
    })

    let merchantArrayRef = db.collection("merchants").doc(merchantData.merchantId);

    await merchantArrayRef.get().then( doc => {
        arrayData = doc.data();
        console.log(arrayData);
        return arrayData;
    }).catch(err => {
        return console.log(err);
    })

    shopList = arrayData.shopList;

    await shopRef.collection("subscribers").doc(userId).get().then( doc => {

        if (!doc.exists) {
            let shopSubscribe = shopRef.collection("subscribers").doc(userId);
            batch.set(shopSubscribe, {
                uid: userId, 
                createAt: admin.firestore.Timestamp.now()
            });

            batch.update(shopRef, {
                subscribers: admin.firestore.FieldValue.increment(1)
            });

            let userSubscribe = userRef.collection("subscribes").doc(shopId);
            batch.set(userSubscribe, {
                uid: shopId, 
                createAt: admin.firestore.Timestamp.now()
            })

            let publicShopSubscribe = publicShopRef.collection("subscribers").doc(userId)
            batch.set(publicShopSubscribe, {
                uid: userId, 
                createAt: admin.firestore.Timestamp.now()
            })

            batch.update(publicShopRef, {
                d: {
                    subscribers: admin.firestore.FieldValue.increment(1)
                }
            })
            
            let merchantSubscribe = db.collection("merchants").doc(merchantData.merchantId).collection("shopList").doc(shopId);
            batch.update(merchantSubscribe, {
                subscribers: admin.firestore.FieldValue.increment(1)
            })

           // let merchantShopList = db.collection("merchants").doc(merchantData.merchantId);
            //console.log(merchantShopList);
            let shopList = arrayData.shopList;
            let subscriber = 0;

            console.log(arrayData.shopList);

            console.log(shopList);
            console.log(merchantData.merchantId);

            for(var i=0; i<shopList.length; i++){
                if(shopList[i].id === shopId){
                    shopList[i].subscribers = shopList[i].subscribers + 1;
                    console.log(shopList[i].subscribers);
                }
            }

            batch.update(merchantArrayRef, {
                shopList: shopList
            }) 

            let publicUserSubscribe =  publicUserRef.collection("subscribes").doc(shopId)
            batch.set(publicUserSubscribe, {
                uid: shopId, createAt: admin.firestore.Timestamp.now()
            })

            batch.commit();

            console.log("--- Operation Success ---");
            return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "subscribe" }));

        } else {

            console.log("User already subscribe the shop");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "subscribe" }));

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        console.log(err);
        return Promise.resolve(res.status(500).json(err));

    });
}; 

// xxx.com/subscribes/removeSubscribe/{shopId}/{userId}
//  https://us-central1-gogogain-gogogain.cloudfunctions.net/posts/removeLike/UWnXqIZ820NMItW6coah/tYCBQUalr1bFzmy0Beyz6h2GOd62
exports.removeSubscribe = async function (req, res) {

    const shopId = req.params.shopId;   
    const userId = req.params.userId;

    let shopRef = db.collection("shops").doc(shopId);
    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);
    let publicShopRef = db.collection("publicShopProfile").doc(shopId);


    let batch = db.batch();

    await shopRef.get().then( doc => {
        merchantData = doc.data();
        console.log(merchantData);
        return merchantData;
    }).catch(err => {
        return console.log(err);
    })

    let merchantArrayRef = db.collection("merchants").doc(merchantData.merchantId);

    await merchantArrayRef.get().then( doc => {
        arrayData = doc.data();
        console.log(arrayData);
        return arrayData;
    }).catch(err => {
        return console.log(err);
    })

    await shopRef.collection("subscribers").doc(userId).get().then( doc => {

        if (doc.exists) {

            let shopSubscribe = shopRef.collection("subscribers").doc(userId);
            batch.delete(shopSubscribe);

            batch.update(shopRef, {
                subscribers: admin.firestore.FieldValue.increment(-1)
            });

            let userSubscribe = userRef.collection("subscribes").doc(shopId);
            batch.delete(userSubscribe);

            let publicShopSubscribe = publicShopRef.collection("subscribers").doc(userId);
            batch.delete(publicShopSubscribe);

            batch.update(publicShopRef, {
                d: {
                    subscribers: admin.firestore.FieldValue.increment(-1)
                }
            })

            let merchantSubscribe = db.collection("merchants").doc(merchantData.merchantId).collection("shopList").doc(shopId);
            batch.update(merchantSubscribe, {
                subscribers: admin.firestore.FieldValue.increment(-1)
            })

            let shopList = arrayData.shopList;
            let subscriber = 0;

            console.log(arrayData.shopList);

            console.log(shopList);

            for(var i=0; i<shopList.length; i++){
                if(shopList[i].id === shopId){
                    shopList[i].subscribers = shopList[i].subscribers - 1;
                }
            }

            batch.update(merchantArrayRef, {
                shopList: shopList
            }) 

            let publicUserSubscribe = publicUserRef.collection("subscribes").doc(shopId);
            batch.delete(publicUserSubscribe);

            batch.commit();

            console.log("--- Operation Success ---");
            return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "unsubscribe" }));

        } else {

            console.log("User already unsubscribe the shop");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "unsubscribe" }));

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return Promise.resolve(res.status(500).json(err));

    });
};  */

exports.subscribe = async function (req, res) {

    const shopID = req.body.shopID;   
    let userID;
    let userData;
    let token = req.headers.authorization.split('Bearer')[1];
    let check;
    let userAddress;

    await admin.auth().verifyIdToken(token).then( decodedToken => {
        console.log(decodedToken);
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Subscribe",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    await db.collection("users").doc(userID).get().then( doc => {
        userData = doc.data();
        console.log(userData);
        return userData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Subscribe",
            "message" : "User information not found"
        })
    });

    userAddress = userData.address;

    let shopRef = db.collection("shops").doc(shopID);
    let userRef = db.collection("users").doc(userID);
    let publicUserRef = db.collection("publicUserProfile").doc(userID);
    let publicShopRef = db.collection("publicShopProfile").doc(shopID);

    let shopData;
    let merchantData;

    let batch = db.batch();

    await shopRef.get().then( doc => {
        shopData = doc.data();
        console.log(shopData);
        return shopData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            "status" : "Failure",  
            "action" : "Subscribe",
            "message" : "Shop information not found"
        });
    })

    let merchantArrayRef = db.collection("merchants").doc(shopData.merchantId);

    await merchantArrayRef.get().then( doc => {
        merchantData = doc.data();
        console.log(merchantData);
        return merchantData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            "status" : "Failure",  
            "action" : "Subscribe",
            "message" : "Merchant information not found"
        });
    })

    shopList = merchantData.shopList;

    await shopRef.collection("subscribers").doc(userID).get().then( doc => {
        if(!doc.exists){
            check = true;
            return check;
        } else {
            check = false;
            return check;
        }
    }).catch(err => { 
        console.log(err);
        return res.status(500).json({
            "status" : "Failure",
            "action" : "Subscribe",
            "message" : "Unable to Subscribe"
        });
    });

    if (check === true) {
        let shopSubscribe = shopRef.collection("subscribers").doc(userID);
        batch.set(shopSubscribe, {
            uid: userID,
            name: userData.name,
            email: userData.email,
            birthday: userData.birthday,
            gender: userData.gender,
            address: {
                country: userAddress.country,
                postcode: userAddress.postcode,
                states: userAddress.states
            },
            createAt: admin.firestore.Timestamp.now()
        });

        batch.update(shopRef, {
            subscribers: admin.firestore.FieldValue.increment(1)
        });

        let userSubscribe = userRef.collection("subscribes").doc(shopID);
        batch.set(userSubscribe, {
            d:{
                shopID: shopID, 
                createAt: admin.firestore.Timestamp.now(),
                address:  shopData.address ? shopData.address : '',
                categories: shopData.categories ? shopData.categories : '',
                coordinates: shopData.coordinates ? shopData.coordinates : '',
                coverPic: shopData.coverPic ? shopData.coverPic : '',
                description: shopData.description ? shopData.description : '',
                displayName: shopData.displayName ? shopData.displayName : '',
                email: shopData.email ? shopData.email : '',
                facebook: shopData.facebook ? shopData.facebook : '',
                instagram: shopData.instagram ? shopData.instagram : '',
                logo: shopData.logo ? shopData.logo : '',
                name: shopData.name ? shopData.name : '',
                operatingHour: shopData.operatingHour ? shopData.operatingHour : '',
                phone: shopData.phone ? shopData.phone : '',
                subscribers: shopData.subscribers ? shopData.subscribers : '',
                tags: shopData.tags ? shopData.tags : '',
                website: shopData.website ? shopData.website : '', 
                whatsapp: shopData.whatsapp ? shopData.whatsapp : '',
            },
            g: shopData.g ? shopData.g : '',
            l: shopData.coordinates ? shopData.coordinates : ''
        })

        let publicShopSubscribe = publicShopRef.collection("subscribers").doc(userID)
        batch.set(publicShopSubscribe, {
            uid: userID,
            name: userData.name,
            email: userData.email,
            birthday: userData.birthday,
            gender: userData.gender,
            address: {
                country: userAddress.country,
                postcode: userAddress.postcode,
                states: userAddress.states
            },
            createAt: admin.firestore.Timestamp.now()
        })

        batch.update(publicShopRef, {
            d: {
                subscribers: admin.firestore.FieldValue.increment(1)
            }
        })
        
        let merchantSubscribe = db.collection("merchants").doc(shopData.merchantId).collection("shopList").doc(shopID);
        batch.update(merchantSubscribe, {
            subscribers: admin.firestore.FieldValue.increment(1)
        })

    // let merchantShopList = db.collection("merchants").doc(merchantData.merchantId);
        //console.log(merchantShopList);
        let shopList = merchantData.shopList;
        let subscriber = 0;

        //console.log(arrayData.shopList);

        //console.log(shopList);
        //console.log(merchantData.merchantId);

        for(var i=0; i<shopList.length; i++){
            if(shopList[i].id === shopID){
                shopList[i].subscribers = shopList[i].subscribers + 1;
                //console.log(shopList[i].subscribers);
            }
        }

        batch.update(merchantArrayRef, {
            shopList: shopList
        }) 

        let publicUserSubscribe =  publicUserRef.collection("subscribes").doc(shopID)
        batch.set(publicUserSubscribe, {
            uid: userID,
            name: userData.name,
            email: userData.email,
            birthday: userData.birthday,
            gender: userData.gender,
            address: {
                country: userAddress.country,
                postcode: userAddress.postcode,
                states: userAddress.states
            },
            createAt: admin.firestore.Timestamp.now()
        })

        batch.commit().then(() => {
            console.log('Subscribe shop successfully');
            return res.status(200).json({ 
                "status" : "Success",  
                "action" : "Subscribe",
                "message" : "Subscribe shop successfully"
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Subscribe",
                "message" : "Failed to unsubscribe shop"
            });
        });

    } else {
        console.log("User already subscribe the shop");
        return res.status(500).json({
            "status" : "Failure", 
            "action" : "Subscribe",
            "message" : "User already subscribe the shop"
        });
    }
}; 


exports.unsubscribe = async function (req, res) {

    const shopID = req.body.shopID;   
    let userID;
    let userData;
    let token = req.headers.authorization.split('Bearer')[1];
    let check;

    await admin.auth().verifyIdToken(token).then( decodedToken => {
        console.log(decodedToken);
        userID = decodedToken.uid;
        return userID;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Unsubscribe",
            "message" : "Authentication token invalid / Unable to retrieve authentication token"
        })
    });

    await db.collection("users").doc(userID).get().then( doc => {
        userData = doc.data();
        console.log(userData);
        return userData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({ 
            "status" : "Failure",  
            "action" : "Unsubscribe",
            "message" : "User information not found"
        })
    });

    let shopRef = db.collection("shops").doc(shopID);
    let userRef = db.collection("users").doc(userID);
    let publicUserRef = db.collection("publicUserProfile").doc(userID);
    let publicShopRef = db.collection("publicShopProfile").doc(shopID);

    let shopData;
    let merchantData;

    let batch = db.batch();

    await shopRef.get().then( doc => {
        shopData = doc.data();
        console.log(shopData);
        return shopData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            "status" : "Failure",  
            "action" : "Unsubscribe",
            "message" : "Shop information not found"
        });
    })

    let merchantArrayRef = db.collection("merchants").doc(shopData.merchantId);

    await merchantArrayRef.get().then( doc => {
        merchantData = doc.data();
        console.log(merchantData);
        return merchantData;
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            "status" : "Failure",  
            "action" : "Unubscribe",
            "message" : "Merchant information not found"
        });
    })

    shopList = merchantData.shopList;

    await shopRef.collection("subscribers").doc(userID).get().then( doc => {
        if(doc.exists){
            check = true;
            return check;
        } else {
            check = false;
            return check;
        }
    }).catch(err => { 
        console.log(err);
        return res.status(500).json({
            "status" : "Failure",
            "action" : "Unsubscribe",
            "message" : "Unable to unsubscribe"
        });
    });

   
    if (check === true) {
        let shopSubscribe = shopRef.collection("subscribers").doc(userID);
        batch.delete(shopSubscribe);

        batch.update(shopRef, {
            subscribers: admin.firestore.FieldValue.increment(-1)
        });

        let userSubscribe = userRef.collection("subscribes").doc(shopID);
        batch.delete(userSubscribe);

        let publicShopSubscribe = publicShopRef.collection("subscribers").doc(userID)
        batch.delete(publicShopSubscribe);

        batch.update(publicShopRef, {
            d: {
                subscribers: admin.firestore.FieldValue.increment(-1)
            }
        })
        
        let merchantSubscribe = db.collection("merchants").doc(shopData.merchantId).collection("shopList").doc(shopID);
        batch.update(merchantSubscribe, {
            subscribers: admin.firestore.FieldValue.increment(-1)
        });

        // let merchantShopList = db.collection("merchants").doc(merchantData.merchantId);
        //console.log(merchantShopList);
        let shopList = merchantData.shopList;
        let subscriber = 0;

        //console.log(arrayData.shopList);

        //console.log(shopList);
        //console.log(merchantData.merchantId);

        for(var i=0; i<shopList.length; i++){
            if(shopList[i].id === shopID){
                shopList[i].subscribers = shopList[i].subscribers - 1;
                //console.log(shopList[i].subscribers);
            }
        }

        batch.update(merchantArrayRef, {
            shopList: shopList
        }) 

        let publicUserSubscribe =  publicUserRef.collection("subscribes").doc(shopID)
        batch.delete(publicUserSubscribe);

        batch.commit().then(() => {
            console.log('Unsubscribe shop successfully');
            return res.status(200).json({ 
                "status" : "Success",  
                "action" : "Unsubscribe",
                "message" : "Unsubscribe shop successfully"
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                "status" : "Failure",
                "action" : "Unsubscribe",
                "message" : "Failed to unsubscribe shop"
            });
        });

    } else {
        console.log("User already unsubscribe the shop");
        return res.status(500).json({
            "status" : "Failure", 
            "action" : "Unsubscribe",
            "message" : "User already unsubscribe the shop"
        });

    }

}; 