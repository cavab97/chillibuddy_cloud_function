import { getRndInteger } from "../../../utils/math/getRandomNumber";
import { sendNotificationToSpecifiedUser } from "../../../utils/notification/notification";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});

const db = admin.firestore();

const userKey = "2skk7Y5JQSR2rPtVMtWk";
const adminKey = "2UjhZm5HIKHsnh4GZVEc";
const merchantKey = "3iwF120dTXDUYpqeYvWc";
const shopKey = "OrKtW5IIf40kOI0c2bAH";

/*
    GENERATE WINNER FOR THE EVENT
*/


export default functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

  const eventId = req.body.eventId;
  let eventPrizesList = [];
  let eventTicketsList = [];
  let winnerList = [];
  let eventDetails = {};

  if (!eventId) {
    console.log(`Event Id Needed`);
    throw res
      .status(500)
      .json({
        status: "Failure",
        action: "Lucky Draw Winner",
        message: "Event Id Needed"
      });
  }

  const eventRef = db.collection("events").doc(eventId);
  const publicEventRef = db.collection("publicEvent").doc(eventId);
  const eventPrizesListRef = db
    .collection("events")
    .doc(eventId)
    .collection("prizes")
    .orderBy("type", "desc");
  const eventTicketsListRef = db
    .collection("events")
    .doc(eventId)
    .collection("tickets");

  //get prizes list
  await eventPrizesListRef
    .get()
    .then(prizeDocs => {
      prizeDocs.forEach(prizeDoc => {
        eventPrizesList.push({ ...prizeDoc.data(), id: prizeDoc.id });
      });
      return null;
    })
    .catch(err => {
      return console.log(err);
    });

  //get Tickets list
  await eventTicketsListRef
    .get()
    .then(ticketDocs => {
      ticketDocs.forEach(ticketDoc => {
        eventTicketsList.push({ ...ticketDoc.data(), id: ticketDoc.id });
      });
      return null;
    })
    .catch(err => {
      return console.log(err);
    });

  //Validate Existance of collection
  if (!Array.isArray(eventPrizesList) || eventPrizesList.length === 0) {
    console.log(`Prize not exist`);
    throw res.status(500).json({
      status: "Failure",
      action: "Lucky Draw Event",
      message: "Prize not exist"
    });
  } else if (
    !Array.isArray(eventTicketsList) ||
    eventTicketsList.length === 0
  ) {
    console.log(`Participant not exist`);
    throw res.status(500).json({
      status: "Failure",
      action: "Lucky Draw Event",
      message: "Participant not exist"
    });
  }

  return db
    .runTransaction(transaction => {
      return transaction.getAll(eventRef).then(data => {
        eventDetails = data[0];

        //validation
        if (!eventDetails.exists) {
          console.log(`Event not exist`);
          throw new String("Event not exist");
        }

        eventDetails = eventDetails.data();
        //console.log(eventDetails.announced)
        //reject request if the event had announced winners
        if (eventDetails.announced) {
          console.log(`The Event Already Announced Winners.`);
          throw new String("The Event Already Announced Winners");
        }

        //Maximum Number Of Prizes Is 100
        if (eventPrizesList.length > 100) {
          console.log(
            `The Number Of Event Prizes is ${eventPrizesList.length}, Can't More Than 100.`
          );
          throw new String(
            `The Number Of Event Prizes is ${eventPrizesList.length}, Can't More Than 100.`
          );
        }

        let ticketIndex = 0;
        let issued1stPrizes = 0;
        let issued2ndPrizes = 0;
        let issued3rdPrizes = 0;
        let issued4thPrizes = 0;

        //Drawing process
        for (let i = 0; i < eventPrizesList.length; i++) {
          ticketIndex = getRndInteger(0, eventTicketsList.length - 1);
          winnerList.push(eventTicketsList[ticketIndex]);

          switch (eventPrizesList[i].type) {
            case "1stPrize":
              issued1stPrizes++;
              break;
            case "2ndPrize":
              issued2ndPrizes++;
              break;
            case "3rdPrize":
              issued3rdPrizes++;
              break;
            case "Consolation Prize":
              issued4thPrizes++;
              break;
          }
          //remove the winner ticket for next drawing
          eventTicketsList.slice(ticketIndex, 1);

          if (!Array.isArray(eventTicketsList) || eventTicketsList.length === 0)
            break;
        }

        //Push winner to prizes List Database from lowest prize to grand award

        for (let i = 0; i < eventPrizesList.length; i++) {
          let eventTicketRef = db
            .collection("events")
            .doc(eventId)
            .collection("tickets")
            .doc(winnerList[i].id);
          let eventPrizeRef = db
            .collection("events")
            .doc(eventId)
            .collection("prizes")
            .doc(eventPrizesList[i].id);
          let userTicketRef = db
            .collection("users")
            .doc(winnerList[i].uid)
            .collection("events")
            .doc(eventId)
            .collection("tickets")
            .doc(winnerList[i].id);
          let userEventRef = db
            .collection("users")
            .doc(winnerList[i].uid)
            .collection("events")
            .doc(eventId);

          transaction.set(
            eventPrizeRef,
            {
              name: winnerList[i].name,
              ticketID: winnerList[i].id,
              uid: winnerList[i].uid
            },
            { merge: true }
          );

          transaction.set(
            eventTicketRef,
            {
              win: true,
              item: eventPrizesList[i].item,
              prizeID: eventPrizesList[i].id,
              type: eventPrizesList[i].type
            },
            { merge: true }
          );

          transaction.set(
            userTicketRef,
            {
              win: true,
              item: eventPrizesList[i].item,
              prizeID: eventPrizesList[i].id,
              type: eventPrizesList[i].type
            },
            { merge: true }
          );
          // ticketID.push(eventTickets.id);

          transaction.set(
            userEventRef,
            {
              announced: true
            },
            { merge: true }
          );
        }

        const winner1stPrizes = winnerList.slice(
          issued4thPrizes + issued3rdPrizes + issued2ndPrizes,
          issued4thPrizes + issued3rdPrizes + issued2ndPrizes + issued1stPrizes
        );
        const winner2ndPrizes = winnerList.slice(
          issued4thPrizes + issued3rdPrizes,
          issued4thPrizes + issued3rdPrizes + issued2ndPrizes
        );
        const winner3rdPrizes = winnerList.slice(
          issued4thPrizes,
          issued4thPrizes + issued3rdPrizes
        );
        const winner4thPrizes = winnerList.slice(0, issued4thPrizes);

        transaction.set(
          eventRef,
          {
            announced: true,
            winner1stPrizes,
            winner2ndPrizes,
            winner3rdPrizes,
            winner4thPrizes
          },
          { merge: true }
        );

        transaction.set(
          publicEventRef,
          {
            announced: true,
            winner1stPrizes,
            winner2ndPrizes,
            winner3rdPrizes,
            winner4thPrizes
          },
          { merge: true }
        );

        return null;
      });
    })
    .then(() => {
      console.log("Lucky Draw Drawing Process Success");

      const messageArray = messageProcessing(winnerList,eventDetails)
      sendNotificationToSpecifiedUser( messageArray );

      return res.status(200).json(
        {
          status: "Success",
          action: "Lucky Draw Event",
          message: `Event ID : [${eventId}] Draw Successfully.`
        }
      );
    })
    .catch(error => {
      console.log("Lucky Draw Drawing Process Error :" + error);
      res.status(500).json(
        {
          status: "Failure",
          action: "Lucky Draw Event",
          message: `Event ID [${eventId}] Draw Error : ${error}.`
        }
      );
    });
});
})

function messageProcessing(winnerList=[], eventDetails) {

    //Notification Message
    let messageArray = winnerList.map(winner => {
        const userId = winner.uid
        const title = `You Won In An Event ${eventDetails.title}`;
        const body = "Check It Out";
        const notificationData = {};
        const priority = "high";
        const iosSubtitle = "Congratulation";
        const iosSound = "default";
        const iosBadge = 0;
        const androidChannelId = "WonInAnEvent";
        const type = "event";
        const subjectType = "user";
        const subjectId = winner.uid;
        const subjectName = winner.name;
        const subjectLogo = eventDetails.logo;
        const objectType = "event";
        const objectId = eventDetails.id;
        const objectName = eventDetails.title;
        const action = "won";

        return {
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
        }
      });
    //console.log(messageArray)
    return messageArray
}
