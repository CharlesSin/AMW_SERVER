import express from "express";
import moment from "moment";
import jwt from "jsonwebtoken";
import admin from "../config/firebase.config";
import dataInfo from "../utils/classes/info.module.js";

const router = express.Router();

// API: User add new project
router.post("/event/create", (req, res) => {
  var projectName = req.body.project;
  var projectID = `${projectName.split(/\s+/).join("")}-${moment.now()}`;
  var decoded = jwt.verify(req.body.token, "secretkey");

  var projectRef = admin.database().ref(`/projects`);
  var eventRef = admin.database().ref(`/event/${projectID}/information`);
  var releaseRef = admin.database().ref(`/event/${projectID}/`);

  projectRef.push({
    projectId: projectID,
    projectName,
    creator: decoded.email,
  });

  releaseRef.update({
    release: false,
  });

  eventRef.set({
    endDate: "",
    eventAuthor: "",
    eventLocation: "",
    eventName: "",
    startDate: "",
    event_deatils: "",
    creator: decoded.email,
  });

  res.status(201).json({ msg: "Event Created" });
});

// API: Getting project view for management page.
router.post("/projets", (req, res) => {
  const user = jwt.verify(req.body.token, "secretkey");
  // user.email //user email address as ID

  admin
    .database()
    .ref(`/projects/`)
    .once("value")
    .then((snap) => {
      var child = snap.val();
      var projects = [];
      for (let i in child) {
        if (child[i].creator === user.email) {
          projects.push({
            projectId: child[i].projectId,
            projectName: child[i].projectName,
          });
        }
      }
      res.status(201).json({ data: projects });
    });
});

// API: Getting select project overview details.
router.post("/project/overview", async (req, res, next) => {
  const user = jwt.verify(req.body.token, "secretkey");

  var releaseREF = admin.database().ref(`/event/${req.body.projectid}/release`);
  const reletrip = await releaseREF.once("value").then((snap) => snap.val());

  admin
    .database()
    .ref(`/event/${req.body.projectid}/information`)
    .once("value")
    .then((snap) => {
      const child = snap.val();
      var data = new dataInfo();
      if (child.creator === user.email) {
        data.endDate = child.endDate;
        data.eventAuthor = child.eventAuthor;
        data.eventLocation = child.eventLocation;
        data.eventName = child.eventName;
        data.startDate = child.startDate;
        data.event_deatils = child.event_deatils;
        data.release = reletrip;
        res.status(201).json({ data });
      } else {
        res.status(400).json({ errmsg: "User ID not match" });
      }
    });
});

// router.post("/getstatus", async function (req, res, next) {
//     // Get project id.
//     var db = firebase.database();

//     var checkInfo = db.ref(`event/${req.session.prjId}`);

//     const trip2 = await checkInfo
//         .child(`/transportImages`)
//         .once("value")
//         .then((snap) => snap.val());
//     // const trip3 = await checkInfo.child(`/sponor`).once('value').then(snap => snap.val());
//     const trip = await checkInfo
//         .child(`/information`)
//         .once("value")
//         .then((snap) => {
//             var chkInfo = snap.val();
//             var iStatus = "";
//             let end = chkInfo.endDate != "";
//             let author = chkInfo.eventAuthor != "";
//             let loc = chkInfo.eventLocation != "";
//             let logo = chkInfo.eventLogo != null;
//             let name = chkInfo.eventName != "";
//             let start = chkInfo.startDate != "";
//             if (end && author && loc && logo && name && start) {
//                 iStatus = "notempty";
//             }
//             return iStatus;
//         });
//     const trip4 = await checkInfo
//         .child(`/schedules`)
//         .once("value")
//         .then((snap) => {
//             var event = snap.val();
//             var eStatus = "notEmpty";
//             for (let i in event) {
//                 var keyValue = event[i];
//                 for (let j in keyValue) {
//                     if (j !== "empty") {
//                         if (keyValue[j].empty) {
//                             eStatus = "empty";
//                         }
//                     }
//                 }
//             }
//             return eStatus;
//         });
//     var transStatus = trip2 != null;
//     var infoStatus = trip != "";
//     var eventStatus = trip4 != "empty";

//     let obj = {
//         infoStatus,
//         transStatus,
//         eventStatus,
//     };

//     res.send(obj);
// });

// // Get Number Of Member API
// router.post("/getmember", function (req, res, next) {
//     // Get project id.
//     var db = firebase.database();

//     var memberRef = db.ref(`/event/${req.session.prjId}/UserList`);

//     const memberNo = new Promise((resolve) => {
//         var noOfMember;
//         memberRef.on("value", async function (snapshot) {
//             var mem = await snapshot.numChildren();
//             noOfMember = mem;
//             resolve(noOfMember);
//         });
//     });

//     memberNo.then((response) => {
//         res.send(`${response}`);
//     });
// });

// router.post("/updatedetails", async function (req, res, next) {
//     var sess = req.session;
//     var loginUser = sess.loginUser;
//     var userID = sess.uid;
//     var prjId = sess.prjId;
//     var dateStart = moment(`${req.body.startdate}`, "YYYY-MM-DD").format("l");
//     var dateEnd = moment(`${req.body.enddate}`, "YYYY-MM-DD").format("l");

//     var db = firebase.database();
//     var infoRef = db.ref(`/event/${prjId}/information`);
//     var releaseRef = db.ref(`/event/${prjId}/`);
//     var dateChk = db.ref(`/event/${prjId}/schedules/`);

//     const date_log = getDatesDiff(dateStart.valueOf(), dateEnd.valueOf());

//     const reletrip = await dateChk.once("value").then((snap) => {
//         var index = snap.val();
//         var array = [];
//         for (let i in index) array.push(i);
//         return array;
//     });

//     if (req.body.projStatus === "1") {
//         releaseRef.update({
//             release: true,
//         });
//     }
//     if (req.body.projStatus === "2") {
//         releaseRef.update({
//             release: false,
//         });
//     }

//     if (JSON.stringify(date_log) == JSON.stringify(reletrip)) {
//         // if match means user just update other infomation only
//         // console.log("match");
//     } else {
//         dateChk.remove();
//         date_log.forEach((dateIndex) => {
//             var dates = moment(`${dateIndex}`, "DD-MMM-YYYY").format("DD-MMM-YYYY");
//             var addData = db.ref(`/event/${prjId}/schedules/${dates}`);
//             addData.set({
//                 empty: true,
//             });
//         });
//     }

//     const promiseUserIdCheck = new Promise((resolve) => {
//         var key = "User Id not match";
//         var dateReply = "";
//         infoRef.on("value", function (snapshot) {
//             var infouserid = snapshot.val();
//             if (infouserid.userId === userID) {
//                 key = "match";
//             }
//         });

//         if (key === "match") {
//             obj = {
//                 key: key,
//                 dateReply: dateReply,
//             };
//             resolve(obj);
//         }
//     });

//     // var retValue = "";
//     promiseUserIdCheck.then((response) => {
//         if (response.key === "match") {
//             infoRef.update({
//                 endDate: req.body.enddate,
//                 eventAuthor: req.body.organizer,
//                 eventLocation: req.body.location,
//                 eventName: req.body.evename,
//                 startDate: req.body.startdate,
//                 event_deatils: req.body.event_deatils,
//                 userId: userID,
//             });
//         }
//         // res.redirect('/dashss');
//         res.send(`更醒成功`);
//     });
// });

// // API: Uploads Logo
// router.post("/logoUpload", m.single("file"), function (req, res, next) {
//     var sess = req.session;
//     var loginUser = sess.loginUser;
//     var userEmail = sess.userEmail;
//     var prjId = sess.prjId;
//     var projectName = sess.prj;
//     var isLogined = !!loginUser;

//     var db = firebase.database();
//     var ref = db.ref(`/event/${prjId}`);
//     var imgRef = ref.child(`/information/eventLogo`);

//     if (!req.file) {
//         res.render("dashss", {
//             msg: "No File Upload",
//             isLogined: isLogined,
//             name: loginUser || "",
//             email: userEmail || "",
//             uid: sess.uid,
//             prjname: projectName || "",
//             prjId: prjId,
//         });
//     }

//     // Create a new blob in the bucket and upload the file data.
//     let newFileNames =
//         "eventLOGO" + "-" + Date.now() + path.extname(req.file.originalname);
//     const blob = bucket.file(newFileNames);

//     // Make sure to set the contentType metadata for the browser to be able
//     // to render the image instead of downloading the file (default behavior)
//     const blobStream = blob.createWriteStream({
//         metadata: {
//             contentType: req.file.mimetype,
//         },
//     });

//     blobStream.on("error", (err) => {
//         next(err);
//         return;
//     });

//     blobStream.on("finish", () => {
//         // The public URL can be used to directly access the file via HTTP.
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//         imgRef.push({
//             imageUrl: publicUrl,
//         });

//         // Make the image public to the web (since we'll be displaying it in browser)
//         blob.makePublic().then(() => {
//             // Success !!!;
//             // Image uploaded to ${publicUrl};
//         });

//         res.redirect("/dashss");
//     });

//     blobStream.end(req.file.buffer);
// });

// // API: Remove Logo
// router.post("/logoRefresh", function (req, res, next) {
//     var sess = req.session;
//     // var project = sess.prjId;

//     var db = firebase.database();
//     var ref = db.ref("/event");
//     var imgData = ref.child(`/${req.body.project}/information/eventLogo`);

//     const promiseImageUrl = new Promise((resolve) => {
//         imgData.on("value", function (snapshot) {
//             var imgUri = snapshot.val();
//             var imageHtml = "";
//             for (let i in imgUri) {
//                 imageHtml +=
//                     '<div class="col-lg-6s col-md-6 col-sm-6 col-xs-6 justify-content-md-center">';
//                 imageHtml += '<img class="img-thumbnail height-150" src="';
//                 imageHtml += imgUri[i].imageUrl;
//                 imageHtml += '"';
//                 imageHtml += 'itemprop="thumbnail" alt="Logo Image" />';
//                 imageHtml +=
//                     '<button type="button" class="btn mr-1 mb-1 btn-danger btn-sm" ';
//                 imageHtml += 'name = "' + imgUri[i].imageUrl + '"';
//                 imageHtml += 'onclick = "return changeFreq(this)" > 刪除</button >';
//                 imageHtml += "</div>";
//             }
//             resolve(imageHtml);
//         });
//     });

//     promiseImageUrl.then((response) => {
//         res.send(response);
//     });
// });

// // API: Refersh Logo
// router.post("/logoDel", function (req, res, next) {
//     var fileNAME = req.body.imgUrl;
//     var delFileName = fileNAME.split("/", 5);

//     var db = firebase.database();

//     // Firebase Storage
//     var buckets = firebase.storage().bucket();

//     // Get a reference to our posts
//     var ref = db.ref(`/event/${req.body.prjid}/information/eventLogo/`);

//     const promiseGetKey = new Promise((resolve, reject) => {
//         // Get the data.
//         ref.on("value", function (snapshot) {
//             var deletedPost = snapshot.val();
//             var key = "Key Error";
//             for (let i in deletedPost) {
//                 if (req.body.imgUrl === deletedPost[i].imageUrl) {
//                     key = i;
//                 }
//             }
//             if (key !== "Key Error") {
//                 resolve(key);
//             } else {
//                 reject("Images Delete Error");
//             }
//         });
//         buckets.file(delFileName[4]).delete();
//     });

//     promiseGetKey
//         .then((response) => {
//             var deleteRef = db.ref(
//                 `/event/${req.body.prjid}/information/eventLogo/${response}`
//             );
//             deleteRef.remove();
//             res.send("Deleted Successfully");
//         })
//         .catch((error) => {
//             res.send(`${error} : Images Key Error `);
//         });
// });

// // API: Remove Project
// router.post("/rmproject", function (req, res, next) {
//     var prjname = req.body.projectname;
//     var prjid = req.body.projectid;
//     prjname = prjname.trim();
//     prjid = prjid.trim();

//     var sess = req.session;
//     var loginUser = sess.loginUser;
//     var userEmail = sess.userEmail;
//     var prjId = sess.prjId;
//     var projectName = sess.prj;
//     var isLogined = !!loginUser;
//     var userid = sess.uid;

//     if (prjid !== prjId && prjname !== projectName) {
//         res.redirect("/logout");
//     }

//     var db = firebase.database();
//     var rmEventRef = db.ref(`/event/${prjid}`);
//     var projectRef = db.ref(`/project`);

//     const promiseRemove = new Promise((resolve, reject) => {
//         projectRef.on("value", function (snapshot) {
//             var proj = snapshot.val();
//             var key = " ";
//             for (let i in proj) {
//                 var vaildId = prjid === proj[i].projectId;
//                 var validName = prjname === proj[i].projectName;
//                 var vaildUser = userid === proj[i].userId;
//                 if (vaildId && validName && vaildUser) {
//                     key = i;
//                 }
//             }
//             resolve(key);
//         });
//     });

//     promiseRemove.then((response) => {
//         var rmProjectRef = projectRef.child(`/${response}`);
//         rmEventRef.remove();
//         rmProjectRef.remove();
//         res.send("Remove Successful");
//     });
// });

export default router;
