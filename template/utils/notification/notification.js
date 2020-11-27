var fetch = require("node-fetch");
import admin from "firebase-admin";
const db = admin.firestore();

import getSpecifiedUsers from '../firebase/firestore/getSpecifiedDocs'

const userKey = "2skk7Y5JQSR2rPtVMtWk";
const adminKey = "2UjhZm5HIKHsnh4GZVEc";
const merchantKey = "3iwF120dTXDUYpqeYvWc";
const shopKey = "OrKtW5IIf40kOI0c2bAH";

//Send Notification To Specified Users
export function sendNotificationToSpecifiedUser(messageArray=[]) {

    /* 
    Variable Format
    messageArray = [
        {
            userId,
            title, 
            body, 
            notificationData, 
            priority, 
            iosSubtitle,
            iosSound,
            iosBadge,
            androidChannelId,
            type,
            subjectType,
            subjectId,
            subjectName,
            subjectLogo,
            objectType,
            objectId,
            objectName,
            action
        },
        {...},{...}
    ]
    */

    let userIdSet = []
    let notificationTokenSet = []
    let messages = {}

    //console.log('messageArray' + JSON.stringify(messageArray))
    messageArray.forEach(message =>{
            userIdSet.push(message.userId)
        })

    //console.log('messageArray' + JSON.stringify(messageArray))
    //console.log('userIdSet' + JSON.stringify(userIdSet))

  //Get 1000 targeted user's tokens
  getSpecifiedUsers('users', userIdSet)
    .then((users) => {

        users.forEach((user)=>{
            //console.log(user.expoNotificationToken)
            notificationTokenSet.push(...user.expoNotificationToken)
        })

        messageArray = messageArray.map((message,index) =>{
            return {
                ...message,
                expoNotificationToken : notificationTokenSet[index]
            }
        })

        messages = multipleMessagesProcessing(messageArray);

        //console.log('messages' + messages)
        
        storeCustomizeNotificationMessage(messageArray)
            .then((response)=>{
                //console.log("storeCustomizeNotificationMessage : " + JSON.stringify(response))
                return null
            })
            .catch((error)=>{console.log("storeCustomizeNotificationMessage Error : " + JSON.stringify(error))})
      
      
      sendToNotificationServer(messages)
        .then(async responses => {
          let unregisterToken = [];
          if (!Array.isArray(responses.data) || responses.data.length === 0) {
            throw new String("No Responses Return.");
          }

          await responses.data.forEach((response, index) => {
            if (response.status === "error") {
              if (response.details.error === "DeviceNotRegistered") {
                unregisterToken.push(notificationTokenSet[index]);
              }
              console.log(response.message);
            }
          });

          if (Array.isArray(unregisterToken) && unregisterToken.length) {
            console.log("Going to delete function");
            deleteUnregisterToken(unregisterToken);
          }
          return null;
        })
        .catch(error => {
          console.log("Expo Notification :" + error);
        });

      return null;
    })
    .catch(error => {
      console.log("Get Users Notification Token Error :" + error);
    });
}

//Send Notification Broadcastly
export default function sendNotification(
  role,
  title,
  body,
  data,
  priority,
  iosSubtitle,
  iosSound,
  iosBadge,
  androidChannelId,
  type,
  subjectType,
  subjectId,
  subjectName,
  subjectLogo,
  objectType,
  objectId,
  objectName,
  action
) {
  let lastVisible = null;
  let notificationTokenSet = [];
  let usersIdSet = [];
  let message = {};
  let response = {};

  while (lastVisible !== undefined) {
    //Get 1000 targeted user's tokens
    getUser(role, 250, lastVisible)
      .then(snapshot => {
        response = snapshot;

        notificationTokenSet = response.notificationTokenSet;
        usersIdSet = response.usersIdSet;

        message = messageProcessing(
          notificationTokenSet,
          title,
          body,
          data,
          priority,
          iosSubtitle,
          iosSound,
          iosBadge,
          androidChannelId
        );

        storeNotificationMessage(
          {
            type,
            subjectType,
            subjectId,
            subjectName,
            subjectLogo,
            objectType,
            objectId,
            objectName,
            action,
            message: body
          },
          usersIdSet
        );

        sendToNotificationServer(message)
          .then(async responses => {
            let unregisterToken = [];
            if (!Array.isArray(responses.data) || responses.data.length === 0) {
              throw new String("No Responses Return.");
            }

            await responses.data.forEach((response, index) => {
              if (response.status === "error") {
                if (response.details.error === "DeviceNotRegistered") {
                  unregisterToken.push(notificationTokenSet[index]);
                }
                console.log(response.message);
              }
            });

            if (Array.isArray(unregisterToken) && unregisterToken.length) {
              console.log("Going to delete function");
              deleteUnregisterToken(unregisterToken);
            }
            return null;
          })
          .catch(error => {
            console.log("Expo Notification :" + error);
          });

        return null;
      })
      .catch(error => {
        console.log("Get Users Token Error :" + error);
      });

    lastVisible = response.lastVisible;
  }
}

//Delete invalid expo notification token
export function deleteUnregisterToken(unregisterToken) {
  let ownersWithKey = [];
  const ownersRef = db
    .collection("users")
    .where("expoNotificationToken", "array-contains-any", unregisterToken);
  const usersRef = db.collection("users");

  return db
    .runTransaction(transaction => {
      //Get users who hold invalid token
      return transaction
        .get(ownersRef)
        .then(users => {
          users.forEach(user => {
            user.data().expoNotificationToken.forEach(token => {
              if (unregisterToken.includes(token)) {
                ownersWithKey.push({
                  uid: user.id,
                  expoNotificationToken: token
                });
              }
            });
          });

          ownersWithKey.forEach(owner => {
            transaction.update(usersRef.doc(owner.uid), {
              expoNotificationToken: admin.firestore.FieldValue.arrayRemove(
                owner.expoNotificationToken
              )
            });
          });
          return ownersWithKey;
        })
        .catch(error => {
          console.log("Get Invalid Notification Token Owners Error : " + error);
        });
    })
    .then(() => {
      console.log(
        "Deleted Invalid Notification Token : " + JSON.stringify(ownersWithKey)
      );
      return null;
    })
    .catch(error => {
      console.log("Delete Unregister Token Error : " + error);
    });
}

//message format processing
export function messageProcessing(
  notificationTokenSet,
  title,
  body,
  data,
  priority,
  iosSubtitle,
  iosSound,
  iosBadge,
  androidChannelId
) {
  // Each message must be a JSON object with the given fields:
  // type PushMessage = {
  //     /**
  //      * An Expo push token or an array of Expo push tokens specifying the recipient(s)
  //      * of this message.
  //      */
  //     to: string | string[],

  //     /**
  //      * A JSON object delivered to your app. It may be up to about 4KiB; the total
  //      * notification payload sent to Apple and Google must be at most 4KiB or else
  //      * you will get a "Message Too Big" error.
  //      */
  //     data?: Object,

  //     /**
  //      * The title to display in the notification. Devices often display this in
  //      * bold above the notification body. Only the title might be displayed on
  //      * devices with smaller screens like Apple Watch.
  //      */
  //     title?: string,

  //     /**
  //      * The message to display in the notification
  //      */
  //     body?: string,

  //     /**
  //      * Time to Live: the number of seconds for which the message may be kept
  //      * around for redelivery if it hasn't been delivered yet. Defaults to
  //      * `undefined` in order to use the respective defaults of each provider.
  //      * These are 0 for iOS/APNs and 2419200 (4 weeks) for Android/FCM and web
  //      * push notifications.
  //      *
  //      * On Android, we make a best effort to deliver messages with zero TTL
  //      * immediately and do not throttle them.
  //      *
  //      * However, note that setting TTL to a low value (e.g. zero) can prevent
  //      * normal-priority notifications from ever reaching Android devices that are
  //      * in doze mode. In order to guarantee that a notification will be delivered,
  //      * TTL must be long enough for the device to wake from doze mode.
  //      *
  //      * This field takes precedence over `expiration` when both are specified.
  //      */
  //     ttl?: number,

  //     /**
  //      * A timestamp since the UNIX epoch specifying when the message expires. This
  //      * has the same effect as the `ttl` field and is just an absolute timestamp
  //      * instead of a relative time.
  //      */
  //     expiration?: number,

  //     /**
  //      * The delivery priority of the message. Specify "default" or omit this field
  //      * to use the default priority on each platform, which is "normal" on Android
  //      * and "high" on iOS.
  //      *
  //      * On Android, normal-priority messages won't open network connections on
  //      * sleeping devices and their delivery may be delayed to conserve the battery.
  //      * High-priority messages are delivered immediately if possible and may wake
  //      * sleeping devices to open network connections, consuming energy.
  //      *
  //      * On iOS, normal-priority messages are sent at a time that takes into account
  //      * power considerations for the device, and may be grouped and delivered in
  //      * bursts. They are throttled and may not be delivered by Apple. High-priority
  //      * messages are sent immediately. Normal priority corresponds to APNs priority
  //      * level 5 and high priority to 10.
  //      */
  //     priority?: 'default' | 'normal' | 'high',

  //     // iOS-specific fields

  //     /**
  //      * The subtitle to display in the notification below the title
  //      */
  //     subtitle?: string,

  //     /**
  //      * A sound to play when the recipient receives this notification. Specify
  //      * "default" to play the device's default notification sound, or omit this
  //      * field to play no sound.
  //      *
  //      * Note that on apps that target Android 8.0+ (if using `expo build`, built
  //      * in June 2018 or later), this setting will have no effect on Android.
  //      * Instead, use `channelId` and a channel with the desired setting.
  //      */
  //     sound?: 'default' | null,

  //     /**
  //      * Number to display in the badge on the app icon. Specify zero to clear the
  //      * badge.
  //      */
  //     badge?: number,

  //     // Android-specific fields

  //     /**
  //      * ID of the Notification Channel through which to display this notification
  //      * on Android devices. If an ID is specified but the corresponding channel
  //      * does not exist on the device (i.e. has not yet been created by your app),
  //      * the notification will not be displayed to the user.
  //      *
  //      * If left null, a "Default" channel will be used, and Expo will create the
  //      * channel on the device if it does not yet exist. However, use caution, as
  //      * the "Default" channel is user-facing and you may not be able to fully
  //      * delete it.
  //      */
  //     channelId?: string,
  //   }
  const message = {
    to: notificationTokenSet,
    title: title,
    body: body,
    data: data,
    priority: priority,
    //Ios field
    subtitle: iosSubtitle,
    sound: iosSound,
    badge: iosBadge,
    //Android field
    channelId: androidChannelId
  };
  return JSON.stringify(message);
}

export function multipleMessagesProcessing(messageArray){

    /* 
    Variable Format
    messageArray = [
        {
            userId,
            expoNotificationToken,
            title, 
            body, 
            notificationData, 
            priority, 
            iosSubtitle,
            iosSound,
            iosBadge,
            androidChannelId,
            type,
            subjectType,
            subjectId,
            subjectName,
            subjectLogo,
            objectType,
            objectId,
            objectName,
            action
        },
        {...},{...}
    ]
    */

   messageArray = messageArray.map((message)=>{
        return{
            to: message.expoNotificationToken,
            title: message.title,
            body: message.body,
            data: message.data,
            priority: message.priority,
            //Ios field
            subtitle: message.iosSubtitle,
            sound: message.iosSound,
            badge: message.iosBadge,
            //Android field
            channelId: message.androidChannelId
        }
   })

   return JSON.stringify(messageArray)

}

//Get User From Firestore
export function getUser(role, noOfUsers, lastVisible) {
  return new Promise((resolve, reject) => {
    db.collection("users")
      .where("role", "==", role)
      .orderBy("created_at")
      .limit(noOfUsers)
      .startAfter(lastVisible)
      .get()
      .then(users => {
        let notificationTokenSet = [];
        let usersIdSet = [];
        users.forEach(user => {
          usersIdSet.push(user.id);
          if (
            user.data().expoNotificationToken !== undefined &&
            user.data().expoNotificationToken !== []
          ) {
            notificationTokenSet.push(...user.data().expoNotificationToken);
          }
        });
        const lastVisible = users.docs[users.docs.length - 1];

        return resolve({ notificationTokenSet, usersIdSet, lastVisible });
      })
      .catch(error => {
        reject(error);
      });
  });
}

//Store Notification Message
export function storeNotificationMessage(message, usersIdSet = []) {
  //Variable Format
  /*
        message = {
            type         : event/post/transaction/...
            subjectType  : shop/merchant/gogogain/user/...
            subjectId    : shopId/merchantId/gogogain/userId/...
            subjectName  : shopName/merchantName/Gogogain/userName/...
            objectType   : event/post/transaction/...
            objectId     : shopId/merchantId/gogogain/userId/...
            objectName   : shopName/merchantName/Gogogain/userName/...
            action       : created/edited/announced/...
            message      : sentenses
        }

        usersIdSet=[
            userId1,
            userId2,
            ...
        ]
    */
  return new Promise((resolve, reject) => {
    if (!usersIdSet) {
      throw new String("Users Id Set Is Empty.");
    }

    const now = admin.firestore.Timestamp.now();
    let batch = db.batch();
    let userNotificationRef;
    let userRef;
    message = {
      type: "undefined",
      subjectType: "undefined",
      subjectId: "undefined",
      subjectName: "undefined",
      subjectLogo: "",
      objectType: "undefined",
      objectId: "undefined",
      objectName: "undefined",
      action: "undefined",
      message: "undefined",
      ...message
    };

    usersIdSet.forEach(userId => {
      userNotificationRef = db
        .collection("users")
        .doc(userId)
        .collection("notification")
        .doc();
      userRef = db.collection("users").doc(userId);

      batch.set(userNotificationRef, {
        type: message.type,
        subjectType: message.subjectType,
        subjectId: message.subjectId,
        subjectName: message.subjectName,
        subjectLogo: message.subjectLogo,
        objectType: message.objectType,
        objectId: message.objectId,
        objectName: message.objectName,
        action: message.action,
        message: message.message,
        created_at: now
      });

      //Increase Unread Flag
      batch.set(
        userRef,
        {
          unreadNotification: admin.firestore.FieldValue.increment(1)
        },
        { merge: true }
      );
    });

    batch
      .commit()
      .then(() => {
        return resolve({
          status: "Success",
          action: "Store Notification Message",
          message: `Store Notification Message Into UserRef Successfully.`,
          object: usersIdSet
        });
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
}

//Store Notification Message
export function storeCustomizeNotificationMessage(messageArray) {
    /* 
    Variable Format
    messageArray = [
        {
            userId,
            expoNotificationToken,
            title, 
            body, 
            notificationData, 
            priority, 
            iosSubtitle,
            iosSound,
            iosBadge,
            androidChannelId,
            type,
            subjectType,
            subjectId,
            subjectName,
            subjectLogo,
            objectType,
            objectId,
            objectName,
            action
        },
        {...},{...}
    ]
    */
    return new Promise((resolve, reject) => {
  
      const now = admin.firestore.Timestamp.now();
      let batch = db.batch();
      let userNotificationRef;
      let userRef;
  
      messageArray.forEach(message => {
        userNotificationRef = db
          .collection("users")
          .doc(message.userId)
          .collection("notification")
          .doc();
        userRef = db.collection("users").doc(message.userId);


        message = {
            type: message.type? message.type : "undefined",
            subjectType: message.subjectType? message.subjectType : "undefined",
            subjectId: message.subjectId? message.subjectId : "undefined",
            subjectName: message.subjectName? message.subjectName : "undefined",
            subjectLogo: message.subjectLogo? message.subjectLogo : "",
            objectType: message.objectType? message.objectType : "undefined",
            objectId: message.objectId? message.objectId : "undefined",
            objectName: message.objectName? message.objectName : "undefined",
            action: message.action? message.action : "undefined",
            message: message.body? message.body : "undefined",
        }
  
        batch.set(userNotificationRef, {
          ...message,
          created_at: now
        });
  
        //Increase Unread Flag
        batch.set(
          userRef,
          {
            unreadNotification: admin.firestore.FieldValue.increment(1)
          },
          { merge: true }
        );
      });
  
      batch
        .commit()
        .then(() => {
          return resolve({
            status: "Success",
            action: "Store Notification Message",
            message: `Store Notification Message Into UserRef Successfully.`,
          });
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }

//Expo Notification Server
export function sendToNotificationServer(messages) {
  console.log("sendToNotificationServer : " + messages)
  return new Promise((resolve, reject) => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "accept-encoding": "gzip, deflate",
        host: "exp.host"
      },
      body: messages
    })
      .then(async response => {

        const responseJson = await response.json();
        // console.log(responseJson)
        // console.log(JSON.stringify(responseJson.errors[0].details))
        return resolve(responseJson);
      })
      .catch(error => {
        reject(error);
      });
  });
}
