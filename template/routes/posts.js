const admin = require("firebase-admin");

const db = admin.firestore();

// req - request, res - respond xxx.com/posts
// https://us-central1-gogogain-gogogain.cloudfunctions.net/posts/
exports.getAllPosts = async function (req, res) {

    let posts = [];

    await db.collection("posts").get().then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
            posts.push(documentSnapshot.data()); 
        })
        console.log("--- Operation Success ---")
        return Promise.resolve(res.status(200).json(posts));
    }).catch(err => { 
        console.log("--- Operation Failure ---")
        return Promise.resolve(res.status(500).json(err));
    });
}; 

// get particular post id xxx.com/posts/{postId}
// https://us-central1-gogogain-gogogain.cloudfunctions.net/posts/UWnXqIZ820NMItW6coah
exports.getPost = async function (req, res) {

    const postId = req.params.postId;
    
    await db.collection("posts").doc(postId).get().then(post => {
        if(!post.exists){
            console.log("User does not exists")
            return Promise.resolve(res.status(500).json({ "message" : "failure" }));
        } else {
            console.log("--- Operation Success ---")
            return Promise.resolve(res.status(200).json(post.data()));
        }
    }).catch(err => { 
        console.log("--- Operation Failure ---")
        return Promise.resolve(res.status(500).json(err));
    });
}; 

// get particular post id xxx.com/posts/{postId}/{userId}
//  https://us-central1-gogogain-gogogain.cloudfunctions.net/posts/updateLike/UWnXqIZ820NMItW6coah/tYCBQUalr1bFzmy0Beyz6h2GOd62
exports.updateLike = async function (req, res) {

    const postId = req.params.postId;   
    const userId = req.params.userId;

    let postRef = db.collection("posts").doc(postId);
    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);
    let publicPostRef = db.collection("publicPost").doc(postId);
    let batch = db.batch();

    await postRef.collection("likes").doc(userId).get().then( doc => {

        if (!doc.exists) {

            let postLikes = postRef.collection("likes").doc(userId);
            batch.set(postLikes, {
                uid: userId, 
                createAt: admin.firestore.Timestamp.now()
            });

            batch.update(postRef, {
                likes: admin.firestore.FieldValue.increment(1)
            });

            let userLikes = userRef.collection("likes").doc(postId);
            batch.set(userLikes, {
                uid: postId, 
                createAt: admin.firestore.Timestamp.now()
            });

            let publicPostLikes =  publicPostRef.collection("likes").doc(userId);
            batch.set(publicPostLikes, {
                uid: userId, 
                createAt: admin.firestore.Timestamp.now()
            });

            batch.update(publicPostRef, {
                likes: admin.firestore.FieldValue.increment(1)
            });

            let publicUserLikes = publicUserRef.collection("likes").doc(postId);
            batch.set(publicUserLikes, {
                uid: postId, 
                createAt: admin.firestore.Timestamp.now()
            });

            batch.commit();
            console.log("--- Operation Success ---");
            return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "like" }));

        } else {

            console.log("User already like the post");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "like" }));

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "like", "errorMessage" : err }));

    });
}; 

// get particular post id xxx.com/posts/{postId}/{userId}
//  https://us-central1-gogogain-gogogain.cloudfunctions.net/posts/removeLike/UWnXqIZ820NMItW6coah/tYCBQUalr1bFzmy0Beyz6h2GOd62
exports.removeLike = async function (req, res) {

    const postId = req.params.postId;   
    const userId = req.params.userId;

    let postRef = db.collection("posts").doc(postId);
    let userRef = db.collection("users").doc(userId);
    let publicUserRef = db.collection("publicUserProfile").doc(userId);
    let publicPostRef = db.collection("publicPost").doc(postId);
    
    let batch = db.batch();

    await postRef.collection("likes").doc(userId).get().then( doc => {

        if (doc.exists) {

           let postLikes = postRef.collection("likes").doc(userId)
           batch.delete(postLikes);

            batch.update(postRef, {
                likes: admin.firestore.FieldValue.increment(-1)
            });

            let userLikes =  userRef.collection("likes").doc(postId);
            batch.delete(userLikes);

            let publicPostLikes = publicPostRef.collection("likes").doc(userId);
            batch.delete(publicPostLikes);

            batch.update(publicPostRef, {
                likes: admin.firestore.FieldValue.increment(-1)
            })

            let publicUserLikes =  publicUserRef.collection("likes").doc(postId)
            batch.delete(publicUserLikes);

            batch.commit();

            console.log("--- Operation Success ---");
            return Promise.resolve(res.status(200).json({ "message" : "success", "action" : "unlike" }));

        } else {

            console.log("User already unlike the post");
            return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "unlike" }));

        }
       
    }).catch(err => { 

        console.log("--- Operation Failure ---");
        return Promise.resolve(res.status(500).json({ "message" : "failure", "action" : "unlike", "errorMessage" : err }));

    });
}; 