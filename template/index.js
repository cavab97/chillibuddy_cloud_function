// firebase init
const functions = require('firebase-functions');
const loadFunctions = require('firebase-function-tools')

const admin = require("firebase-admin");

const serviceAccountDev = require("./key/serviceAccountKey-dev.json");
const serviceAccountStaging = require("./key/serviceAccountKey-staging.json");
const serviceAccountProd = require("./key/serviceAccountKey-prod.json");

if(process.env.GCLOUD_PROJECT === 'gogogain-dev')
    {
        admin.initializeApp({
        credential: admin.credential.cert(serviceAccountDev),
        databaseURL: "https://gogogain-dev.firebaseio.com"
    });
} else if(process.env.GCLOUD_PROJECT === 'gogogain-stanging')
{
    admin.initializeApp({
    credential: admin.credential.cert(serviceAccountStaging),
    databaseURL: "https://gogogain-stanging.firebaseio.com"
});
} else if(process.env.GCLOUD_PROJECT === 'gogogain-gogogain')
{
    admin.initializeApp({
    credential: admin.credential.cert(serviceAccountProd),
    databaseURL: "https://gogogain-gogogain.firebaseio.com"
});
}


loadFunctions(__dirname, exports)

const db = admin.firestore();

const moment = require('moment');

// express and cors init
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

// middleware init
/* const user = express();
user.use(bodyParser.urlencoded({
    extended: false
})); */
//user.use(bodyParser.json());

const post = express();
post.use(cors());

const subscribe = express();
subscribe.use(cors());

const event = express();
event.use(cors());
event.use(cors({ origin: true }));

// const public = express();
// public.use(cors()); 

const transaction = express();
transaction.use(cors());

// import routes
let usersEndpoint = require('./routes/users');
let postsEndpoint = require('./routes/posts');
let subscribesEndpoint = require('./routes/subscribers');
let eventsEndpoint = require('./routes/events');
let transactionsEndpoint = require('./routes/transaction');

//START HTTP API FUNCTIONS

/* user.post('/createPublicUser', usersEndpoint.createUser); 

exports.users = functions.https.onRequest(user);  */

post.post('/updateLike/:postId/:userId', postsEndpoint.updateLike);
post.post('/removeLike/:postId/:userId', postsEndpoint.removeLike);

exports.posts = functions.https.onRequest(post); 

//subscribe.post('/updateSubscribe/:shopId/:userId', subscribesEndpoint.updateSubscribe);
//subscribe.post('/removeSubscribe/:shopId/:userId', subscribesEndpoint.removeSubscribe);
subscribe.post('/subscribe', subscribesEndpoint.subscribe);
subscribe.post('/unsubscribe', subscribesEndpoint.unsubscribe);

exports.subscribes = functions.https.onRequest(subscribe);

//event.post('/updateJoin/:eventId/:userId', eventsEndpoint.updateJoin);
//event.post('/removeJoin/:eventId/:userId', eventsEndpoint.removeJoin);
event.post('/create', eventsEndpoint.create);
event.put('/update', eventsEndpoint.update);
event.put('/delete', eventsEndpoint.delete);
event.put('/restore', eventsEndpoint.restore);
event.put('/join', eventsEndpoint.join);

exports.events = functions.https.onRequest(event);

transaction.post('/:senderId/:senderType/:senderAmount/:senderPoint/:receiverId/:receiverType/:receiverUsername', transactionsEndpoint.createTransaction);

exports.transactions = functions.https.onRequest(transaction);

// END HTTP API FUNCTIONS


// START TRIGGER FUNCTIONS

exports.createPublicShop = functions.firestore.document('shops/{shopId}').onCreate(async (snap, context) => {
    const docData = snap.data();
 
    const id = context.params.shopId;

    let publicShopRef = db.collection('publicShopProfile').doc(id);
    let shopRef = db.collection('shops').doc(id);
    let transactionRef = db.collection("shops").doc(id).collection("transactions").doc(id);
    let dailyReportRef = db.collection("shops").doc(id).collection("dailyReports").doc(id);
    let reportRef = db.collection("shops").doc(id).collection("reports").doc(id);
    let pointRef = db.collection("shops").doc(id).collection("points").doc("balance");
    let merchantRef = db.collection('merchants').doc(docData.merchantId);
    let merchantShopRef = db.collection('merchants').doc(docData.merchantId).collection('shopList').doc(id);

    let batch = db.batch();
    let merchantData;
    let userData;
    let userRoleData;

    await merchantRef.get().then( doc => {
        merchantData = doc.data();
        console.log(merchantData);
        return merchantData;
    }).catch(err => {
        return console.log(err);
    })

    let userRef = db.collection('users').doc(docData.adminID);
    let userRoleInfoRef = db.collection('users').doc(docData.adminID).collection('permission').doc('roleInfo');

    await userRef.get().then( doc => {
        userData = doc.data();
        console.log(userData);
        return userData;
    }).catch(err => {
        return console.log(err);
    })

    await userRoleInfoRef.get().then( doc => {
        userRoleData = doc.data();
        console.log(userRoleData);
        return userRoleData;
    }).catch(err => {
        return console.log(err);
    })

    batch.set(publicShopRef, {
        d: {
            address: docData.address ? docData.address:
            {country:'',
            line1:'',
            line2:'',
            postcode:'',
            states:''},
            categories: docData.categories ? docData.categories:[],
            coordinates: docData.coordinates ? docData.coordinates:['',''],
            coverPic: docData.coverPic ? docData.coverPic: '',
            createAt: admin.firestore.Timestamp.now(),
            deleted_at: null,
            displayName: docData.displayName ? docData.displayName: '',
            email: docData.email ? docData.email:'',
            website: docData.website ? docData.website:'',
            description: docData.description ? docData.description:'',
            facebook: docData.facebook ? docData.facebook:'',
            id: docData.id?docData.id:'',
            instagram: docData.instagram ? docData.instagram:'',
            logo: docData.logo ? docData.logo:'',
            merchantId: docData.merchantId?docData.merchantId:'',
            name: docData.name ? docData.name:'',
            operatingHour: docData.operatingHour ? docData.operatingHour:
            [
                {close:1800,day:"mon",open:600,operate:true},
                {close:1800,day:"tue",open:600,operate:true},
                {close:1800,day:"wed",open:600,operate:true},
                {close:1800,day:"thu",open:600,operate:true},
                {close:1800,day:"fri",open:600,operate:true},
                {close:1800,day:"sat",open:600,operate:true},
                {close:1800,day:"sun",open:600,operate:true}
              ],
            phone: docData.phone ? docData.phone:'',
            tags: docData.tags ? docData.tags:[],
            whatsapp: docData.whatsapp ? docData.whatsapp:'',
            subscribers: docData.subscribers ? docData.subscribers:0
        },
        g: docData.g ? docData.g:'',
        l: docData.coordinates ? docData.coordinates:'',
    });

    batch.update(shopRef, {
        createAt: admin.firestore.Timestamp.now(),
        deleted_at: null,
    })

    batch.set(pointRef, {
        points: 0
    });

    batch.update(userRef, {
        // merchantID: docData.merchantId?docData.merchantId:'', 
        shopID: id?id:'',
    });

    batch.update(userRoleInfoRef, {
        // merchantID: docData.merchantId?docData.merchantId:'', 
        shopID: id?id:'',
    });
    
    batch.set(merchantShopRef, {
        id: id?id:'',
        subscribers: docData.subscribers ? docData.subscribers:0,
        name: docData.name ? docData.name:''
    });

    batch.set(transactionRef, {
        id: id
    })

    batch.set(dailyReportRef, {
        id: id
    })

    batch.set(reportRef, {
        id: id
    })

    batch.update(merchantRef, {
        shopList: admin.firestore.FieldValue.arrayUnion({
            id: id?id:'',
            subscribers: docData.subscribers ? docData.subscribers:0,
            name: docData.name ? docData.name:''
        })
    });

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
    }).catch(err => {
        return console.log(err);
    });
});

exports.updatePublicShop = functions.firestore.document('shops/{shopId}').onUpdate((change, context) => {
    const isDocExists = change.after.exists;

    const id = context.params.shopId;

    let publicShopRef = db.collection('publicShopProfile').doc(id);

    let batch = db.batch();
    
    if (isDocExists) {
        const afterDocData = change.after.data();

        batch.update(publicShopRef, {
            d: {
                address: afterDocData.address ? afterDocData.address:
                {country:'',
                line1:'',
                line2:'',
                postcode:'',
                states:''},
                categories: afterDocData.categories ? afterDocData.categories:[],
                coordinates: afterDocData.coordinates ? afterDocData.coordinates:['',''],
                coverPic: afterDocData.coverPic ? afterDocData.coverPic:'',
                createAt: afterDocData.createAt ? afterDocData.createAt:'',
                deleted_at: afterDocData.deleted_at ? afterDocData.deleted_at:null,
                displayName: afterDocData.displayName ? afterDocData.displayName:'',
                description: afterDocData.description ? afterDocData.description:'',
                website: afterDocData.website ? afterDocData.website:'',
                email: afterDocData.email ? afterDocData.email:'',
                facebook: afterDocData.facebook ? afterDocData.facebook:'',
                id: afterDocData.id?afterDocData.id:'',
                instagram: afterDocData.instagram ? afterDocData.instagram:'',
                logo: afterDocData.logo ? afterDocData.logo:'',
                merchantId: afterDocData.merchantId?afterDocData.merchantId:'',
                name: afterDocData.name ? afterDocData.name:'',
                operatingHour: afterDocData.operatingHour ? afterDocData.operatingHour:
                [
                    {close:1800,day:"mon",open:600,operate:true},
                    {close:1800,day:"tue",open:600,operate:true},
                    {close:1800,day:"wed",open:600,operate:true},
                    {close:1800,day:"thu",open:600,operate:true},
                    {close:1800,day:"fri",open:600,operate:true},
                    {close:1800,day:"sat",open:600,operate:true},
                    {close:1800,day:"sun",open:600,operate:true}
                  ],
                phone: afterDocData.phone ? afterDocData.phone:'',
                tags: afterDocData.tags ? afterDocData.tags:[],
                whatsapp: afterDocData.whatsapp ? afterDocData.whatsapp:'',
                subscribers: afterDocData.subscribers ? afterDocData.subscribers:0
            },
            g: afterDocData.g ? afterDocData.g:'',
            l: afterDocData.coordinates ? afterDocData.coordinates:'',
        });
    }
    
    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
    }).catch(err => {
        return console.log(err);
    });
});

exports.createPublicPosts = functions.firestore.document('posts/{postId}').onCreate(async (snap, context) => {
    const docData = snap.data();
    
    const id = context.params.postId;
    let shopID = docData.shopID;

    let publicPostRef = db.collection('publicPost').doc(id);
    let shopRef = db.collection('shops').doc(shopID);
    let postRef = db.collection('posts').doc(id);
    let shopPostRef = db.collection('shops').doc(shopID).collection("posts").doc(id);
    let shopPublicPostRef = db.collection('publicShopProfile').doc(shopID).collection("posts").doc(id);
    let shopData;

    let batch = db.batch();

    //public post
    await shopRef.get().then( doc => {
        shopData = doc.data();
        console.log(shopData);
        return shopData;
    }).catch(err => {
        return console.log(err);
    })

    batch.update(postRef, {
        address: shopData.address?shopData.address:
        {country:'',
                line1:'',
                line2:'',
                postcode:'',
                states:''}, //
        name: shopData.displayName?shopData.displayName:'',//
        operatingHour: shopData.operatingHour?shopData.operatingHour:
        [
            {close:1800,day:"mon",open:600,operate:true},
            {close:1800,day:"tue",open:600,operate:true},
            {close:1800,day:"wed",open:600,operate:true},
            {close:1800,day:"thu",open:600,operate:true},
            {close:1800,day:"fri",open:600,operate:true},
            {close:1800,day:"sat",open:600,operate:true},
            {close:1800,day:"sun",open:600,operate:true}
          ],
        phone: shopData.phone?shopData.phone:'',//
    });

    batch.set(publicPostRef, {
        address: shopData.address?shopData.address:
        {country:'',
                line1:'',
                line2:'',
                postcode:'',
                states:''}, //
        coverPic: docData.coverPic ? docData.coverPic : '',
        createAt: docData.createAt ? docData.createAt: '',
        deleted_at: docData.deleted_at ? docData.deleted_at: null,
        description: docData.description ? docData.description:'',
        endDate: docData.endDate ? docData.endDate: '',
        likes: docData.likes ? docData.likes: 0,
        logo: docData.logo ? docData.logo: '',
        name: shopData.displayName?shopData.displayName:'',//
        operatingHour: shopData.operatingHour?shopData.operatingHour:
        [
            {close:1800,day:"mon",open:600,operate:true},
            {close:1800,day:"tue",open:600,operate:true},
            {close:1800,day:"wed",open:600,operate:true},
            {close:1800,day:"thu",open:600,operate:true},
            {close:1800,day:"fri",open:600,operate:true},
            {close:1800,day:"sat",open:600,operate:true},
            {close:1800,day:"sun",open:600,operate:true}
          ],
        phone: shopData.phone?shopData.phone:'',//
        startDate: docData.startDate ? docData.startDate:'',
        subImage: docData.subImage ? docData.subImage: '',
        termAndCon: docData.termAndCon ? docData.termAndCon:'',
        title: docData.title ? docData.title:'',
        author: 'shop', //For Temporary
        shopID: docData.shopID,
        notificationTitle: docData.notificationTitle? docData.notificationTitle:'',
        notificationBody: docData.notificationBody? docData.notificationBody:'',
        notificationIosSubtitle: docData.notificationIosSubtitle? docData.notificationIosSubtitle:'',

    });

    batch.set(shopPostRef, {
        postID: id,
        createdAt: docData.createAt,
    });

    batch.set(shopPublicPostRef, {
        postID: id,
        createdAt: docData.createAt,
    })

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.updatePublicPosts = functions.firestore.document('posts/{postId}').onUpdate(async (change, context) => {
    const isDocExists = change.after.exists;

    const id = context.params.postId;

    let publicPostRef = db.collection('publicPost').doc(id);
    let postRef = db.collection('posts').doc(id);

    let postData;
    let shopData;
    let shopID;

    postData = await postRef.get().then( doc => {
        console.log(doc.data());
        return doc.data();
    }).catch(err => {
        return console.log(err);
    })

    shopID = postData.shopID;

    let shopRef = db.collection('shops').doc(shopID);

    shopData = await shopRef.get().then( doc => {
        console.log(doc.data());
        return doc.data();
    }).catch(err => {
        return console.log(err);
    })
 
    let batch = db.batch();
    console.log(isDocExists);
    if (isDocExists) {
        const afterDocData = change.after.data();
        console.log(afterDocData);
        batch.update(publicPostRef, {
            address: shopData.address?shopData.address:
            {country:'',
            line1:'',
            line2:'',
            postcode:'',
            states:''},
            coverPic: afterDocData.coverPic ? afterDocData.coverPic:'',
            description: afterDocData.description ? afterDocData.description:'',
            endDate: afterDocData.endDate ? afterDocData.endDate:'',
            likes: afterDocData.likes ? afterDocData.likes:0,
            logo: afterDocData.logo ? afterDocData.logo:'',
            name: shopData.displayName?shopData.displayName:'',
            createAt: afterDocData.createAt ? afterDocData.createAt:'',
            deleted_at: afterDocData.deleted_at ? afterDocData.deleted_at:null,
            operatingHour: shopData.operatingHour?shopData.operatingHour:
            [
                {close:1800,day:"mon",open:600,operate:true},
                {close:1800,day:"tue",open:600,operate:true},
                {close:1800,day:"wed",open:600,operate:true},
                {close:1800,day:"thu",open:600,operate:true},
                {close:1800,day:"fri",open:600,operate:true},
                {close:1800,day:"sat",open:600,operate:true},
                {close:1800,day:"sun",open:600,operate:true}
              ],
            phone: shopData.phone?shopData.phone:'',
            startDate: afterDocData.startDate ? afterDocData.startDate:'',
            subImage: afterDocData.subImage ? afterDocData.subImage:'',
            termAndCon: afterDocData.termAndCon ? afterDocData.termAndCon:'',
            title: afterDocData.title ? afterDocData.title:''
        });
    }

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

//havent tested public events
/* exports.createPublicEvents = functions.firestore.document('events/{eventId}').onCreate(async (snap, context) => {
    const docData = snap.data();
    console.log(docData);
    const id = context.params.eventId;
    let shopID = docData.shopID;

    let publicEventRef = db.collection('publicEvent').doc(id);
    let shopRef = db.collection('shops').doc(shopID);
    let eventRef = db.collection('events').doc(id);
    let shopEventRef = db.collection('shops').doc(shopID).collection("events").doc(id);
    let shopPublicEventRef = db.collection('publicShopProfile').doc(shopID).collection("events").doc(id);
    let shopData;

    let batch = db.batch();

    await shopRef.get().then( doc => {
        shopData = doc.data();
        return shopData;
    }).catch(err => {
        return console.log(err);
    })

    batch.update(eventRef, {
        address: shopData.address?shopData.address:
        {
              country:'',
              line1:'',
              line2:'',
              postcode:'',
              states:'',
            },
        name: shopData.name?shopData.name:'',//
        operatingHour: shopData.operatingHour?shopData.operatingHour:
        [
            {close:1800,day:"mon",open:600,operate:true},
            {close:1800,day:"tue",open:600,operate:true},
            {close:1800,day:"wed",open:600,operate:true},
            {close:1800,day:"thu",open:600,operate:true},
            {close:1800,day:"fri",open:600,operate:true},
            {close:1800,day:"sat",open:600,operate:true},
            {close:1800,day:"sun",open:600,operate:true}
          ],
        phone: shopData.phone?shopData.phone:'',//
    });

    batch.set(publicEventRef, {
        address: shopData.address ? shopData.address:
        {
              country:'',
              line1:'',
              line2:'',
              postcode:'',
              states:'',
            },
        coverPic: docData.coverPic ? docData.coverPic:'',
        createAt: docData.createAt ? docData.createAt:'',
        deleted_at: docData.deleted_at ? docData.deleted_at:null,
        description: docData.description ? docData.description:'',
        endDate: docData.endDate ? docData.endDate:'',
        numJoined: docData.numJoined ? docData.numJoined:0,
        logo: docData.logo ? docData.logo:'',
        shopName: shopData.name ? shopData.name:'',
        operatingHour: shopData.operatingHour ? shopData.operatingHour:
        [
            {close:1800,day:"mon",open:600,operate:true},
            {close:1800,day:"tue",open:600,operate:true},
            {close:1800,day:"wed",open:600,operate:true},
            {close:1800,day:"thu",open:600,operate:true},
            {close:1800,day:"fri",open:600,operate:true},
            {close:1800,day:"sat",open:600,operate:true},
            {close:1800,day:"sun",open:600,operate:true}
          ],
        phone: shopData.phone ? shopData.phone:'',
        prizes: docData.prizes ? docData.prizes:['','',''],
        startDate: docData.startDate ? docData.startDate:'',
        subImage: docData.subImage ? docData.subImage:[],
        termAndCon: docData.termAndCon ? docData.termAndCon:'',
        title: docData.title ? docData.title:''
    });

    batch.set(shopEventRef, {
        eventID: id?id:'',
        createAt: admin.firestore.Timestamp.now()
    })

    batch.set(shopPublicEventRef, {
        eventID: id?id:'',
        createAt: admin.firestore.Timestamp.now()
    })

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.updatePublicEvents = functions.firestore.document('events/{eventId}').onUpdate(async (change, context) => {
    const isDocExists = change.after.exists;

    const id = context.params.eventId;

    let publicEventRef = db.collection('publicEvent').doc(id);
    let eventRef = db.collection('events').doc(id);

    let eventData;
    let shopData;
    let shopID;

    await eventRef.get().then( doc => {
        eventData = doc.data();
        console.log(eventData);
        return eventData;
    }).catch(err => {
        return console.log(err);
    })

    shopID = eventData.shopID;

    let shopRef = db.collection('shops').doc(shopID);

    await shopRef.get().then( doc => {
        shopData = doc.data();
        console.log(shopData);
        return shopData;
    }).catch(err => {
        return console.log(err);
    })

    let batch = db.batch();
    console.log("Enter Batch")

    if (isDocExists) {
        const afterDocData = change.after.data();

        batch.update(publicEventRef, {
            address: shopData.address?shopData.address:
            {
                country:'',
                line1:'',
                line2:'',
                postcode:'',
                states:'',
              },
            coverPic: afterDocData.coverPic?afterDocData.coverPic:'',
            createAt: afterDocData.createAt?afterDocData.createAt:'',
            deleted_at: afterDocData.deleted_at?afterDocData.deleted_at:null,
            description: afterDocData.description?afterDocData.description:'',
            endDate: afterDocData.endDate?afterDocData.endDate:'',
            numJoined: afterDocData.numJoined?afterDocData.numJoined:0,
            logo: afterDocData.logo?afterDocData.logo:'',
            shopName: shopData.name?shopData.name:'',
            operatingHour: shopData.operatingHour?shopData.operatingHour:
            [
                {close:1800,day:"mon",open:600,operate:true},
                {close:1800,day:"tue",open:600,operate:true},
                {close:1800,day:"wed",open:600,operate:true},
                {close:1800,day:"thu",open:600,operate:true},
                {close:1800,day:"fri",open:600,operate:true},
                {close:1800,day:"sat",open:600,operate:true},
                {close:1800,day:"sun",open:600,operate:true}
              ],
            phone: shopData.phone?shopData.phone:'',
            prizes: afterDocData.prizes?afterDocData.prizes:[],
            startDate: afterDocData.startDate?afterDocData.startDate:'',
            subImage: afterDocData.subImage?afterDocData.subImage:'',
            termAndCon: afterDocData.termAndCon?afterDocData.termAndCon:'',
            title: afterDocData.title?afterDocData.title:''
        });
    }

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
}); */

exports.createPublicUser = functions.firestore.document('users/{userId}').onCreate(async (snap, context) => {
    const docData = snap.data();
    const id = context.params.userId;

    let userRef = db.collection('users').doc(id); 
    let publicUserRef = db.collection('publicUserProfile').doc(id); 
    let userRoleInfoRef = db.collection("users").doc(id).collection("permission").doc("roleInfo");
    let pointRef = db.collection("users").doc(id).collection("points").doc("balance");

    let userRole = docData.role;
    let merchantID = docData.merchantID;
    let shopID = docData.shopID;
    let roleData;

    let address = docData.address;

    let batch = db.batch();

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

    // if (roleData.role === undefined || roleData.role === ""){
    //     userRole = "2skk7Y5JQSR2rPtVMtWk";
    //     merchantID = "";
    //     shopID = "";
    // } else {
    //     userRole = roleData.role;
    //     merchantID = roleData.merchantID;
    //     shopID = roleData.shopID
    // }

    batch.set(publicUserRef, {
        avatar: docData.avatar?docData.avatar:'',
        address: { 
            country: address.country?address.country:'',
            postcode: address.postcode?address.postcode:'',
            states: address.states?address.states:'',
        },
        created_at: admin.firestore.Timestamp.now(),
        deleted_at: null,
        //birthday: docData.birthday?docData.birthday:'',
        email: docData.email?docData.email:"",
        gender: docData.gender?docData.gender:"",
        name: docData.name?docData.name:"",
    });

    batch.update(userRef, {
        role: userRole?userRole:"",
        merchantID: merchantID?merchantID:"",
        shopID: shopID?shopID:'',
        points: 200,
        created_at: admin.firestore.Timestamp.now(),
        deleted_at: null
    });

    batch.set(userRoleInfoRef, {
        role: userRole?userRole:"",
        merchantID: merchantID?merchantID:"",
        shopID: shopID?shopID:'',
    });

    batch.set(pointRef, {
        points: 200
    });

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        console.log("--- Operation Failure ---")
        return console.log(err);
    });
});

exports.updatePublicUser = functions.firestore.document('users/{userId}').onUpdate(async (change, context) => {
    const isDocExists = change.after.exists;
    const id = context.params.userId;

    let userRef = db.collection('users').doc(id); 

    let publicUserRef = db.collection('publicUserProfile').doc(id);
    let userRoleInfoRef = db.collection("users").doc(id).collection("permission").doc("roleInfo");

    const afterDocData = change.after.data();
    let address = afterDocData.address
    //console.log(address);
    let batch = db.batch();
    let roleData;
    //console.log(isDocExists)

    await userRoleInfoRef.get().then( doc => {
        const exists = (doc.exists);
        if (exists) {
            roleData = doc.data();
        }
        else
        {
            roleData={userRole : "2skk7Y5JQSR2rPtVMtWk", merchantID:'',shopID:''}
        }
        
        return roleData;
    }).catch(err => {
        return console.log(err);
    })
   
    if (isDocExists) {
        batch.update(publicUserRef, {
            avatar: afterDocData.avatar?afterDocData.avatar:'',
            address: { 
                country: address.country?address.country:'',
                postcode: address.postcode?address.postcode:'',
                states: address.states?address.states:'',
            },
            //birthday: afterDocData.birthday?afterDocData.birthday:'',
            //created_at: afterDocData.created_at,
            deleted_at: afterDocData.deleted_at?afterDocData.deleted_at:null,
            email: afterDocData.email?afterDocData.email:'',
            gender: afterDocData.gender?afterDocData.gender:'',
            name: afterDocData.name?afterDocData.name:'',
        });
    
        batch.update(userRoleInfoRef, {
            role: roleData.role?roleData.role:'',
            merchantID: roleData.merchantID?roleData.merchantID:'',
            shopID: roleData.shopID?roleData.shopID:'',
        });

        return batch.commit().then(() => {
            return console.log("--- Operation Success ---");
        }).catch(err => {
            console.log("--- Operation Failure ---")
            return console.log(err);
        });
    }
});

exports.createPublicMerchants = functions.firestore.document('merchants/{merchantId}').onCreate(async (snap, context) => {
    const docData = snap.data();

    const id = context.params.merchantId;

    let publicMerchantRef = db.collection('publicMerchantProfile').doc(id);
    let merchantRef = db.collection('merchants').doc(id);
    let userRef = db.collection('users').doc(docData.superAdminID); 
    let userRoleInfoRef = db.collection('users').doc(docData.superAdminID).collection("permission").doc("roleInfo");

    let batch = db.batch();
    let userRoleData;
    let userData;

    await userRef.get().then( doc => {
        userData = doc.data();
        console.log(userData);
        return userData;
    }).catch(err => {
        return console.log(err);
    })

    await userRoleInfoRef.get().then( doc => {
        userRoleData = doc.data();
        console.log(userRoleData);
        return userRoleData;
    }).catch(err => {
        return console.log(err);
    })

    batch.set(publicMerchantRef, {
        address: docData.address?docData.address:
        {
            country:'',
            line1:'',
            line2:'',
            postcode:'',
            states:'',
          },
        createAt: admin.firestore.Timestamp.now(),
        deleted_at: null,
        shopList: docData.shopList?docData.shopList:[],
        likes: docData.likes?docData.likes:0,
        logo: docData.logo?docData.logo:'',
        email: docData.email?docData.email:'',
        name: docData.name?docData.name:'',
    });

    batch.update(merchantRef, {
        createAt: admin.firestore.Timestamp.now(),
        deleted_at: null
    })

    batch.update(userRef, {
        merchantID: id?id:''
    })

    batch.update(userRoleInfoRef, {
        merchantID: id?id:''
    })

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.updatePublicMerchants = functions.firestore.document('merchants/{merchantId}').onUpdate((change, context) => {
    const isDocExists = change.after.exists;

    const id = context.params.merchantId;

    let publicMerchantRef = db.collection('publicMerchantProfile').doc(id);

    let batch = db.batch();

    if (isDocExists) {
        const afterDocData = change.after.data();
        console.log(afterDocData)
        batch.update(publicMerchantRef, {
            address: afterDocData.address?afterDocData.address:{
                country:'',
                line1:'',
                line2:'',
                postcode:'',
                states:'',
              },
            //createAt: afterDocData.createAt?afterDocData.createAt:{},
            deleted_at: afterDocData.deleted_at?afterDocData.deleted_at:null,
            shopList: afterDocData.shopList?afterDocData.shopList:[],
            likes: afterDocData.likes?afterDocData.likes:0,
            logo: afterDocData.logo?afterDocData.logo:'',
            email: afterDocData.email?afterDocData.email:'',
            name: afterDocData.name?afterDocData.name:'',
        });
    }

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.createCategories = functions.firestore.document('settings/shops/categories/{categoryId}').onCreate((snap, context) => {
    const docData = snap.data();
   
    const id = context.params.categoryId;

    let publicCategories = db.collection('publicSettings').doc("shops").collection("categories").doc(id);
 
    let batch = db.batch();

    batch.set(publicCategories, {
        id: docData.id?docData.id:'',
        no: docData.no?docData.no:'',
        tags: docData.tags?docData.tags:[],
        title: docData.title?docData.title:'',
        created_at: admin.firestore.Timestamp.now(),
        deleted_at: null
    });

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.updateCategories = functions.firestore.document('settings/shops/categories/{categoryId}').onUpdate((change, context) => {
    const isDocExists = change.after.exists;
   
    const id = context.params.categoryId;

    let publicCategories = db.collection('publicSettings').doc("shops").collection("categories").doc(id);
 
    let batch = db.batch();

    if (isDocExists) {
        const afterDocData = change.after.data();

        batch.update(publicCategories, {
            //id: afterDocData.id,
            no: afterDocData.no?afterDocData.no:0,
            tags: afterDocData.tags?afterDocData.tags:[],
            title: afterDocData.title?afterDocData.title:'',
            // created_at: afterDocData.created_at,
            deleted_at: afterDocData.deleted_at?afterDocData.deleted_at:null
        });    
    }

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.createTags = functions.firestore.document('settings/shops/tags/{tagId}').onCreate((snap, context) => {
    const docData = snap.data();

    const id = context.params.tagId;

    let publicTags = db.collection('publicSettings').doc("shops").collection("tags").doc(id);

    
    


    batch.set(publicTags, {
        id: docData.id?docData.id:'',
        no: docData.no?docData.no:'',
        title: docData.title?docData.title:'',
        created_at: admin.firestore.Timestamp.now(),
        deleted_at: null
    });

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

exports.updateTags = functions.firestore.document('settings/shops/tags/{tagId}').onUpdate((change, context) => {
    const isDocExists = change.after.exists;

    const id = context.params.tagId;

    let publicTags = db.collection('publicSettings').doc("shops").collection("tags").doc(id);

    let batch = db.batch();

    if (isDocExists) {
        const afterDocData = change.after.data();

        batch.update(publicTags, {
            //id: afterDocData.id,
            no: afterDocData.no?afterDocData.no:0,
            title: afterDocData.title?afterDocData.title:'',
            // created_at: afterDocData.created_at,
            deleted_at: afterDocData.deleted_at?afterDocData.deleted_at:null
        });    
    }

    return batch.commit().then(() => {
        return console.log("--- Operation Success ---");
        //return res.status(200).json({ "message" : "success", "action" : "publicPost" });
    }).catch(err => {
        return console.log(err);
    });
});

// END TRIGGER FUNCTIONS

exports.generateReport = functions.pubsub.schedule('0 0,2,4,6,8,10,12,14,16,18,20,22 * * *').timeZone('Asia/Kuala_Lumpur').onRun(async (context) => {
    console.log(context);

    const currentTime = admin.firestore.Timestamp.now();
    let m1 = moment();
    m1.startOf('day');
   //console.log(m1);

    const shopSnapshot = await db.collection("shops").get();
    let shopDoc = shopSnapshot.docs.map(doc => doc.data());

    const promises = [];
    let transactionList = [];
    let reportList = [];

    let i = 0;
 
    //console.log(shopDoc);

    shopDoc = shopDoc.filter(shop => !!shop.key);
    //console.log(shopDoc);

    for(var j=0; j<shopDoc.length; j++){
        console.log("Enter shop ID:"+shopDoc[j].key);
        promises.push(db.collection("shops")
            .doc(shopDoc[j].key)
            .collection("transactions")
            .orderBy("createAt")
            .where("createAt", ">", m1.toDate())
            .where("createAt", "<=", currentTime)
            .get()
        );
    }  

    const snapshotArrays = await Promise.all(promises);

    snapshotArrays.forEach(snapArray => {
        snapArray.forEach(snap => {
            //console.log(snap.data());
            transactionList.push({data: snap.data(), key: shopDoc[i].key});
        })
        i++;
    }); 

    for(var k=0; k<shopDoc.length; k++){
        let amount = 0;
        for (var l=0; l<transactionList.length; l++){
            if(shopDoc[k].key === transactionList[l].key){
                //console.log("get date");
                    amount += transactionList[l].data.amount;
                    console.log(amount);
            }
        }
        reportList.push({amount: amount, key: shopDoc[k].key});
    }

    console.log(reportList);
    console.log(transactionList);
 
    for(var m=0; m<reportList.length; m++){
        let reportRef = db.collection('shops').doc(reportList[m].key).collection('reports').doc();
        reportRef.set({
            amount: reportList[m].amount,
            createAt: admin.firestore.Timestamp.now()
        })
    }

});

exports.generateReportDay = functions.pubsub.schedule('1 0 * * *').timeZone('Asia/Kuala_Lumpur').onRun(async (context) => {
    console.log(context);

    const currentTime = admin.firestore.Timestamp.now();
    let m1 = moment();
    let m2 = moment();

    m1.add(-1, 'days');
    m2.add(-1, 'days');

    m1.startOf('day');
    m2.endOf('day');
   //console.log(m1);

    const shopSnapshot = await db.collection("shops").get();
    let shopDoc = shopSnapshot.docs.map(doc => doc.data());

    const promises = [];
    let transactionList = [];
    let reportList = [];

    let i = 0;
 
    //console.log(shopDoc);

    shopDoc = shopDoc.filter(shop => !!shop.key);
    //console.log(shopDoc);

    for(var j=0; j<shopDoc.length; j++){
        console.log("Enter shop ID:"+shopDoc[j].key);
        promises.push(db.collection("shops")
            .doc(shopDoc[j].key)
            .collection("transactions")
            .orderBy("createAt")
            .where("createAt", ">", m1.toDate())
            .where("createAt", "<=", m2.toDate())
            .get()
        );
    }  

    const snapshotArrays = await Promise.all(promises);

    snapshotArrays.forEach(snapArray => {
        snapArray.forEach(snap => {
            //console.log(snap.data());
            transactionList.push({data: snap.data(), key: shopDoc[i].key});
        })
        i++;
    }); 

    for(var k=0; k<shopDoc.length; k++){
        let amount = 0;
        for (var l=0; l<transactionList.length; l++){
            if(shopDoc[k].key === transactionList[l].key){
                //console.log("get date");
                    amount += transactionList[l].data.amount;
                    console.log(amount);
            }
        }
        reportList.push({amount: amount, key: shopDoc[k].key});
    }

    console.log(reportList);
    console.log(transactionList);

    for(var m=0; m<reportList.length; m++){
        let reportRef = db.collection('shops').doc(reportList[m].key).collection('dailyReports').doc();
        reportRef.set({
            amount: reportList[m].amount,
            createAt: admin.firestore.Timestamp.now()
        })
    }
});

