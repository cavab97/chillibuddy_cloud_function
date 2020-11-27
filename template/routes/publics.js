const admin = require("firebase-admin");

const db = admin.firestore();

// xxx.com/publics/updatePost/{postId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updatePost/32tWoRvZnFM62lAg0mnq
exports.updatePost = function (req, res) {
    
    const postId = req.params.postId;   

    let postRef = db.collection("posts").doc(postId);
    let publicPostRef = db.collection("publicPost").doc(postId);

    let batch = db.batch();

    postRef.get().then( doc => {

        if (doc.exists) {

            let docData = doc.data();

            batch.set(publicPostRef, {
                address: docData.address,
                coverPic: docData.coverPic,
                description: docData.description,
                endDate: docData.endDate,
                likes: docData.likes,
                logo: docData.logo,
                name: docData.name,
                operatingHour: docData.operatingHour,
                phone: docData.phone,
                startDate: docData.startDate,
                subImage: docData.subImage,
                termAndCon: docData.termAndCon,
                title: docData.title
            });

            batch.commit();
            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicPost" });

        } else {

            console.log("Post not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicPost" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicPost", "errorMessage" : err });

    });
}

// xxx.com/publics/updateEvent/{eventId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateEvent/SROcH39UP1TLzja7IV9t
exports.updateEvent = function (req, res) {
    
    const eventId = req.params.eventId;   

    let eventRef = db.collection("events").doc(eventId);
    let publicEventRef = db.collection("publicEvent").doc(eventId);

    let batch = db.batch();

    eventRef.get().then( doc => {

        if (doc.exists) {

            let docData = doc.data();

            batch.set(publicEventRef, {
                address: docData.address,
                coverPic: docData.coverPic,
                description: docData.description,
                endDate: docData.endDate,
                numJoined: docData.numJoined,
                logo: docData.logo,
                shopName: docData.shopName,
                operatingHour: docData.operatingHour,
                phone: docData.phone,
                prizes: docData.prizes,
                startDate: docData.startDate,
                subImage: docData.subImage,
                termAndCon: docData.termAndCon,
                title: docData.title
            });

            batch.commit();
            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicEvent" });

        } else {

            console.log("Event not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicEvent" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicEvent", "errorMessage" : err });

    });
}

// xxx.com/publics/updateShop/{shopId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateShop/r9G46eUVDVxhEnbs0VNo
exports.updateShop = function (req, res) {
    
    const shopId = req.params.shopId;   

    let shopRef = db.collection("shops").doc(shopId);
    let publicShopRef = db.collection("publicShopProfile").doc(shopId);

    let batch = db.batch();

    shopRef.get().then( doc => {

        if (doc.exists) {

            let docData = doc.data();

            batch.set(publicShopRef, {
                d: {
                    address: docData.address,
                    avatar: docData.avatar,
                    categories: docData.categories,
                    coordinates: docData.coordinates,
                    coverPic: docData.coverPic,
                    createAt: docData.createAt,
                    displayName: docData.displayName,
                    email: docData.email,
                    facebook: docData.facebook,
                    id: docData.id,
                    instagram: docData.instagram,
                    merchantId: docData.merchantId,
                    name: docData.name,
                    operatingHour: docData.operatingHour,
                    phone: docData.phone,
                    tags: docData.tags,
                    whatsapp: docData.whatsapp,
                    subscribers: docData.subscribers
                },
                g: docData.g,
                l: docData.l,
            });
            
            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicShop" });

        } else {

            console.log("Shop not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicShop" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicShop", "errorMessage" : err });

    });
}

// xxx.com/publics/updateUserProfile/{userId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateUser/XnferHFWclffYbzgz5JrJUDXWJd2
exports.updateUser = function (req, res) {
    
    const userId = req.params.userId;   

    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);

    let batch = db.batch();
    
    userRef.get().then( doc => {
        
        if (doc.exists) {

            let docData = doc.data();
            let dataAddress = docData.address;

            batch.set(publicUserRef, {
                
                avatar: docData.avatar,
                address: {
                    country: dataAddress.country,
                    postcode: dataAddress.postcode,
                    states: dataAddress.states,
                },
                birthday: docData.birthday,
                email: docData.email,
                gender: docData.gender,
                name: docData.name,
            });

            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicUserProfile" });

        } else {

            console.log("User not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicUserProfile" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicUserProfile", "errorMessage" : err });

    });
}

// xxx.com/publics/updateMerchant/{merchantId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateMerchant/KZDjNNhPXbDZLbGe3aHN
exports.updateMerchant = function (req, res) {
    
    const merchantId = req.params.merchantId;   

    let merchantRef = db.collection("merchants").doc(merchantId);
    let publicMerchantRef = db.collection("publicMerchantProfile").doc(merchantId);

    let batch = db.batch();
    
    merchantRef.get().then( doc => {
        
        if (doc.exists) {

            let docData = doc.data();

            batch.set(publicMerchantRef, {
                avatar: docData.avatar,
                address: docData.address,
                shopList: docData.shopList,
                likes: docData.likes,
                logo: docData.logo,
                email: docData.email,
                name: docData.name,
            });

            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicMerchantProfile" });

        } else {

            console.log("Merchant not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicMerchantProfile" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicMerchantProfile", "errorMessage" : err });

    });
}

// xxx.com/publics/updateCategories/{categoriesId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateCategories/1575008897034
exports.updateCategories = function (req, res) {

    const categoriesId = req.params.categoriesId;   
    
    let settingRef = db.collection("settings").doc("shops").collection("categories").doc(categoriesId);
    let publicSettingRef = db.collection("publicSettings").doc("shops").collection("categories").doc(categoriesId);

    let batch = db.batch();
    
    settingRef.get().then( doc => {

        if (doc.exists) {

            let docData = doc.data();
     
            batch.set(publicSettingRef, {
                id: docData.id,
                no: docData.no,
                tags: docData.tags,
                title: docData.title,
            });

            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicSetting - shopCategories" });

        } else {

            console.log("Categories not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicSetting - shopCategories" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicSetting - shopCategories", "errorMessage" : err});

    });
}

// xxx.com/publics/updateTags/{tagsId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateTags/1575008825808
exports.updateTags = function (req, res) {

    const tagsId = req.params.tagsId;   
    
    let settingRef = db.collection("settings").doc("shops").collection("tags").doc(tagsId);
    let publicSettingRef = db.collection("publicSettings").doc("shops").collection("tags").doc(tagsId);

    let batch = db.batch();
    
    settingRef.get().then( doc => {

        if (doc.exists) {

            let docData = doc.data();

            batch.set(publicSettingRef, {
                id: docData.id,
                no: docData.no,
                title: docData.title,
            });

            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicSetting - shopTags" });

        } else {

            console.log("Tags not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicSetting - shopTags" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicSetting - shopTags", "errorMessage" : err });

    });
}

// xxx.com/publics/updateRoleTypes/{roleId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/publics/updateRoleTypes/2UjhZm5HIKHsnh4GZVEc
exports.updateRoleTypes = function (req, res) {

    const roleId = req.params.roleId;   
    
    let roleRef = db.collection("settings").doc("users").collection("roles").doc(roleId);
    let publicRoleRef = db.collection("publicSettings").doc("users").collection("roles").doc(roleId);

    let batch = db.batch();
    
    roleRef.get().then( doc => {

        if (doc.exists) {

            let docData = doc.data();

            batch.set(publicRoleRef, {
                id: docData.id,
                no: docData.no,
                title: docData.title,
            });

            batch.commit();

            console.log("--- Operation Success ---");
            return res.status(200).json({ "message" : "success", "action" : "publicSetting - userRoles" });

        } else {

            console.log("Roles not found");
            return res.status(500).json({ "message" : "failure", "action" : "publicSetting - userRoles" });

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return res.status(500).json({ "message" : "failure", "action" : "publicSetting - userRoles", "errorMessage" : {err} });

    });
}

