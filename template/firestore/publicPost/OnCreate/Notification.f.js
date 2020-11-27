import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import sendNotification from '../../../utils/notification/notification'

const userKey = '2skk7Y5JQSR2rPtVMtWk'
const adminKey = '2UjhZm5HIKHsnh4GZVEc'
const merchantKey = '3iwF120dTXDUYpqeYvWc'
const shopKey = 'OrKtW5IIf40kOI0c2bAH'

//New Post Created Notification For All Users
export default functions.firestore.document('publicPost/{postId}')
    .onCreate((snap, context) => {
    
    const   post             =   snap.data();
    const   type              =   'post';
    const   subjectType       =   post.author;
    const   subjectId         =   post.shopID;
    const   subjectName       =   post.name;
    const   subjectLogo       =   post.logo;
    const   objectType        =   'post';
    const   objectId          =   context.params.postId;
    const   objectName        =   post.title;
    const   action            =   'created'
    let     postTitle         =   'New Post';
    let     postDescription   =   'New Post Had Been Created';
    let     postAuthor        =   'Post Author';

    if(post.title)
        postTitle = post.title;

    if(post.description)
        postDescription = post.description;

    if(post.name)
        postAuthor = post.name;

    let     title             =   `${postTitle} - ${postAuthor}`;
    let     body              =   postDescription;
    const   data              =   {};
    const   priority          =   'high';
    let     iosSubtitle       =   '';
    const   iosSound          =   'default';
    const   iosBadge          =   0;
    const   androidChannelId  =   'NewPost'  
    
    if(post.notificationTitle)
        title = post.notificationTitle;

    if(post.notificationBody)
        body = post.notificationBody;
    
    if(post.notificationIosSubtitle)
        iosSubtitle = post.notificationIosSubtitle
    

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
        action,)

    return null
});