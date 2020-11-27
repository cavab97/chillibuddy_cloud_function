const functions = require('firebase-functions');
const admin = require("firebase-admin");

var fetch = require('node-fetch')


const db = admin.firestore();

import { FIREBASE_CLOUD_FUNCTION } from '../../../assets/constants'
import { LuckyDrawDrawWinner } from '../../../assets/functionsName'

/*
    GENERATE WINNER FOR EVENT
    - check everyday at a certain time whether there is any event open for draw
    - winner uid will be placed at event 1st, 2nd place, 3rd place and consolation 
*/

export default functions.pubsub.schedule('every day 17:57')
    .timeZone('Asia/Kuala_Lumpur').onRun(async (context) => {
        let now = new Date()
        now = now.setHours(16,0,0,0)
        now = now  - 86400000
        //nanosecond into microsecond
        const today =  admin.firestore.Timestamp.fromMillis(now); 

        let eventsDrawTodayList =[]
        let httpSuccessResponseSet = []
        let httpFailureResponseSet = []

        const luckyDrawEventDrawTodayRef = db.collection("events")
                             .where('eventType', '==', 'luckyDraw')
                             .where('announcementDate', '==', today)

        return db.runTransaction((transaction) =>{
            //Get users who hold invalid token
            return transaction.get(luckyDrawEventDrawTodayRef)
                .then(async(events)=>{
                    events.forEach((event)=>{
                        eventsDrawTodayList.push(event.id)
                    })
                    console.log(JSON.stringify(eventsDrawTodayList))
                    await Promise.all( eventsDrawTodayList.map(async event =>{
                            fetch(`${FIREBASE_CLOUD_FUNCTION}/${LuckyDrawDrawWinner}`, {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Access-Control-Allow-Origin': '*',
                                        'Content-Type' : 'application/json',
                                    },
                                    body: JSON.stringify({eventId: event})
                                }).then(async (response)=>{
                                    httpSuccessResponseSet.push(await response.json())
                                    console.log('httpSuccessResponseSet' + httpSuccessResponseSet)
                                    return null
                                }).catch((error)=>{
                                    httpFailureResponseSet.push(error)
                                    console.log('httpFailureResponseSet'+ httpFailureResponseSet)
                                });
                        })).catch((error)=>{
                            console.log("Http Request Set : " +error)
                        })
                    
                    return null
                })
                .catch((error)=>{
                    console.log("Get Lucky Draw Event Error : " + error)
                })
        }).then(()=>{
            console.log("Lucky Draw Drawing Process Success")
            return null
        }).catch((error)=>{
            console.log("Lucky Draw Drawing Process Error :" + error)
        })
});

