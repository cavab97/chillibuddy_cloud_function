import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import sendNotification from '../../../utils/notification/notification'

const userKey = '2skk7Y5JQSR2rPtVMtWk'
const adminKey = '2UjhZm5HIKHsnh4GZVEc'
const merchantKey = '3iwF120dTXDUYpqeYvWc'
const shopKey = 'OrKtW5IIf40kOI0c2bAH'

//New Event Created Notification For All Users
export default functions.firestore.document('publicEvent/{eventId}')
    .onCreate((snap, context) => {
    
    const   event             =   snap.data();
    const   type              =   'event';
    const   subjectType       =   event.organizer;
    const   subjectId         =   event.shopID;
    const   subjectName       =   event.displayName;
    const   subjectLogo       =   event.logo;
    const   objectType        =   'event';
    const   objectId          =   context.params.eventId;
    const   objectName        =   event.title;
    const   action            =   'created'
    let     eventTitle        =   'New Event';
    let     eventDescription  =   'New Event Had Been Created';
    let     eventOrganizer    =   'Event Organizer';

    if(event.title)
        eventTitle = event.title;

    if(event.shortDescription)
        eventDescription = event.shortDescription;

    if(event.displayName)
        eventOrganizer = event.displayName;

    let     title             =   `${eventTitle} - ${eventOrganizer}`;
    let     body              =   eventDescription;
    const   data              =   {};
    const   priority          =   'high';
    let     iosSubtitle       =   '';
    const   iosSound          =   'default';
    const   iosBadge          =   0;
    const   androidChannelId  =   'NewEvent'  
    
    if(event.notificationTitle)
        title = event.notificationTitle;

    if(event.notificationBody)
        body = event.notificationBody;
    
    if(event.notificationIosSubtitle)
        iosSubtitle = event.notificationIosSubtitle
    

    sendNotification( 
        userKey,
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
        action,
        )

    return null
});