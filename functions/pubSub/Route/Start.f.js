// import * as functions from "firebase-functions";
// import { route as object } from "../../z-tools/system/objectsConfig";
// import { dataServices as objectDataServices } from "../../z-tools/marslab-library-cloud-function/services/database";

// const objectName = "route";

// export default functions.region("asia-east2").pubsub
//   .schedule("every 5 minutes")
//   .onRun(async (context) => {
//     try {
//       const startRouteIds = [];

//       await objectDataServices.db
//         .collection(`${objectName}Private0`)
//         .where("published.boolean", "==", true)
//         .where("startTime", "<=", objectDataServices.Time.now())
//         .where("ongoing.at", "==", null)
//         .get()
//         .then((startRoutes) => {
//           startRoutes.forEach((route) => {
//             startRouteIds.push(route.id);
//           });
//           return startRouteIds;
//         });

//       const ongoing = {
//         at: objectDataServices.Time.now(),
//         by: "system",
//         boolean: true,
//       };

//       const writePromise = []

//       startRouteIds.forEach((routeId)=>{
//         const ref = `${objectName}Private0/${routeId}`
//         const update = objectDataServices.db.doc(ref).update({ongoing})
//         writePromise.push(update)
//       })

//       return await Promise.all(writePromise)
//     } catch (error) {
//       return console.log(error);
//     }
//   });