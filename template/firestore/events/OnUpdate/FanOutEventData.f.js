import * as functions from 'firebase-functions'
import admin from 'firebase-admin'

const db = admin.firestore();

//New Event Created Notification For All Users
export default functions.firestore.document('events/{eventId}')
    .onUpdate(async (snap, context) => {
    
    const   event               =   snap.after.data();
    const   eventId             =   context.params.eventId;

    let batch = db.batch();

    const eventParticipantsRef  = db.collection('events').doc(eventId).collection('participants')

    const participants = await eventParticipantsRef
                                .get()
                                .catch(error=>{
                                    console.log(error)
                                    return
                                })
    
        if (participants.empty) {
            console.log('No Participants For the Event.');
            return;
        }
       
        participants.forEach(participant=>{
            batch.set(
                db.collection('users')
                .doc(participant.id)
                .collection('events')
                .doc(eventId)
                ,event
                ,{merge:true});
        })

        return batch.commit().then(function () {
            return console.log("Event "+ eventId+ " fan out successfully.")
          }).catch((error)=>{
            return console.log("Event "+ eventId+ " fan out error : " + error)
          });

});