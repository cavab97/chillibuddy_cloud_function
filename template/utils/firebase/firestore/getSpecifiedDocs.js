import admin from "firebase-admin";
const db = admin.firestore();

export default async function getSpecifiedDocs(ref, docIdSet=[]) {
    
    return new Promise(async (resolve, reject)=>{

        try{
            const refs = docIdSet.map(id => db.doc(`${ref}/${id}`))
            let docs = await db.getAll(...refs)
            
            docs = docs.map(doc => {
                console.log(doc.data())
                return doc.data()
            })
            resolve(docs);

        }catch(error){
            reject(error)
        }
    })
    
}