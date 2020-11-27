import * as functions from 'firebase-functions'
import admin from 'firebase-admin'

export default functions.auth.user().onCreate((uRecord, context) => {
    // User Information
    const userRecord = uRecord || {}
    const email = userRecord.email?userRecord.email:userRecord.providerData[0].email // The email of the user.
    const photoURL = userRecord.photoURL?userRecord.photoURL:userRecord.providerData[0].photoURL?userRecord.providerData[0].photoURL:''
    const displayName = userRecord.displayName?userRecord.displayName:'Anonymous'; // The display name of the user.
    const createAt = admin.firestore.Timestamp.now();
    const phoneNumber = userRecord.phoneNumber?userRecord.phoneNumber:null;
    const providerData = userRecord.providerData?userRecord.providerData:[]
    const uid = userRecord.uid

    const provider =
        userRecord.providerData !== []
          ? userRecord.providerData[0]
          : { providerId: email ? 'password' : 'phone' }

    const providerId = provider.providerId
        ? provider.providerId.replace('.com', '')
        : provider.providerId

    admin.auth().updateUser(uid,{
        email,
        //photoURL,
        displayName,
        phoneNumber
    }).catch((error)=>{
        console.log('Auth Update User Error :'+error);
    })

    //Firestore Ref
    const userRef = admin.firestore()
                .collection('users').doc(uid);

    const publicUserProfileRef = admin.firestore()
                .collection('publicUserProfile').doc(uid);

     //Firestore Operation
    let batch = admin.firestore().batch();

    const userObject = {
        address: {
            country: "",
            line1: "",
            line2: "",
            postcode: "",
            states: ""
          },
        name:displayName,
        email,
        gender:null,
        birthday:null,
        phoneNumber,
        avatar: photoURL,
        isNewUser:true,
        verified:false,
        providerId
    }
    //Set User Document 
    batch.set( 
        userRef, 
        userObject
        ,{ merge: true })

    //Set User Profile Document 
    batch.set( 
        publicUserProfileRef, 
        userObject
        ,{ merge: true })

    return batch.commit().then(() => {
        console.log('Create User successfully');
        return
    }).catch(err => {
        console.log(err);
        console.log('Somethings went wrong during init user document, therefore the user deleted, Resign-up needed');
        admin.auth().deleteUser(uid)
    });
})