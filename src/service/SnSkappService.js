import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";
import {
  getJSONfromIDB,
  IDB_STORE_SKAPP,
  IDB_STORE_SKAPP_AGGREGATED_DATA,
  setJSONinIDB,
} from "../service/SnIndexedDB";
import {
  ANONYMOUS,
  DK_AGGREGATED_PUBLISHED_APPS,
  DK_AGGREGATED_PUBLISHED_APPS_STATS,
  DK_AGGREGATED_USERIDS,
  DK_HOSTED_APPS,
  DK_INSTALLED_APPS,
  DK_PUBLISHED_APPS,
  EVENT_APP_ACCESSED,
  EVENT_APP_FAVORITE,
  EVENT_APP_FAVORITE_REMOVED,
  EVENT_APP_INSTALLED,
  EVENT_APP_LIKED,
  EVENT_APP_LIKED_REMOVED,
  EVENT_APP_UNINSTALLED,
  EVENT_APP_VIEWED,
  EVENT_PUBLISHED_APP,
} from "../utils/SnConstants";
import {
  getContentDAC,
  getFile_MySky,
  getProfileDAC,
  getSocialDAC,
  getUserID,
  putFile_MySky,
} from "./skynet-api";
import { emitEvent } from "./SnSkyMQEventEmitter";
import {
  getFile,
  getFile_SkyDB,
  getProviderKeysByType,
  getRegistryEntry,
  getRegistryEntryURL,
  uploadFile,
} from "./SnSkynet";
var _ = require("lodash");

// TODO: implement actual logic
function generateSkappId(prop) {
  return uuidv4();
}
// Provider Type: GEQ Provider, Aggregator, Validator, Moderator, Blocklist Manager
// This JS file will list app methods consumed by components

// ### User Profile Functionality ###
// null or publicKey
// export const getProfile = async () => {
//   try {
//     //set options
//     const profileDAC = await getProfileDAC();
//     //return await getFile_MySky("userProfile", { skydb: true })?.data
//     const userID = await getUserID()
//     return await profileDAC.getProfile(userID);
//     //return JSON.parse(BROWSER_STORAGE.getItem('userProfile'));
//   }
//   catch (e) {
//     console.log("profileDAC.getProfile : failed =" + e)
//     return null;
//   }
//   // getFile_MySky( "userProfile", { skydb: true })
// }

export const getProfile = async (userID) => {
  try {
    //set options
    const profileDAC = await getProfileDAC();
    //return await getFile_MySky("userProfile", { skydb: true })?.data
    if (userID == null || userID === undefined) {
      //If userID is null or empty
      const myUserId = await getUserID();
      return await profileDAC.getProfile(myUserId);
    } else {
      return await profileDAC.getProfile(userID);
    }
    //return JSON.parse(BROWSER_STORAGE.getItem('userProfile'));
  } catch (e) {
    console.log("profileDAC.getProfile : failed =" + e);
    return null;
  }
  // getFile_MySky( "userProfile", { skydb: true })
};

export const setProfile = async (profileJSON) => {
  //set options
  //const resultObj = await putFile_MySky("userProfile", profileJSON, { skydb: true });
  //BROWSER_STORAGE.setItem('userProfile', JSON.stringify(profileJSON));
  let resultObj = null;
  try {
    const profileDAC = await getProfileDAC();
    resultObj = await profileDAC.setProfile(profileJSON);
    const profile = await getProfile();
    console.log("profileDAC.setProfile : After write : =" + profile);
    // const contentDAC = await getContentDAC();
    // await contentDAC.recordNewContent({skylink: resultObj.dataLink,metadata: { contentType: "userprofile", action: "update" },});
    return profileJSON;
  } catch (e) {
    console.log("profileDAC.setProfile : failed =" + e);
  }
  return {};
  // await putFile_MySky("userProfile", profileJSON, { skydb: true });
};

export const getPreferences = async () => {
  //set options
  //return JSON.parse(BROWSER_STORAGE.getItem('userPreferences'));
  // return await getFile_MySky( "userPreferences", { skydb: true })
  try {
    //set options
    const profileDAC = await getProfileDAC();
    //return await getFile_MySky("userProfile", { skydb: true })?.data
    const userID = await getUserID();
    return await profileDAC.getPreferences(userID);
    //return JSON.parse(BROWSER_STORAGE.getItem('userProfile'));
  } catch (e) {
    console.log("profileDAC.getPreferences : failed =" + e);
    return null;
  }
};
export const setPreferences = async (preferencesJSON) => {
  let resultObj = null;
  try {
    const profileDAC = await getProfileDAC();
    //set options
    resultObj = await profileDAC.setPreferences(preferencesJSON);
    // const contentDAC = await getContentDAC();
    // await contentDAC.recordNewContent({skylink: resultObj.dataLink,metadata: { contentType: "preferences", action: "update" },});
  return preferencesJSON;
} catch (e) {
  console.log("profileDAC.setPreferences : failed =" + e);
}
return {};
};
// ### Following/Followers Functionality ###

export const getFollowingForUser = async (userID) => {
  const socialDAC = await getSocialDAC();
  const followingList = await socialDAC.getFollowingForUser(
    userID ?? (await getUserID())
  );
  console.log("getFollowingForUser" + followingList);
  // try {
  //     // const contentDAC = await getContentDAC();
  //     // await contentDAC.recordNewContent({ skylink: resultObj.dataLink, metadata: { "contentType": "following", "action": "add" } });
  //  } catch (e) {
  //   console.log("contentDAC.recordNewContent : failed =" + e)
  // }
  return followingList;
};

export const getFollowingCountForUser = async (userID) => {
  const socialDAC = await getSocialDAC();
  const userId = userID ?? (await getUserID());
  console.log("getFollowingCountForUser:userId" + userId);
  console.log("getFollowingCountForUser:socialDAC" + socialDAC);
  const followingCount = await socialDAC.getFollowingCountForUser(userId);
  console.log("getFollowingCountForUser" + followingCount);
  // try {
  //     // const contentDAC = await getContentDAC();
  //     // await contentDAC.recordNewContent({ skylink: resultObj.dataLink, metadata: { "contentType": "following", "action": "add" } });
  //  } catch (e) {
  //   console.log("contentDAC.recordNewContent : failed =" + e)
  // }
  return followingCount;
};

export const follow = async (userID) => {
  const socialDAC = await getSocialDAC();
  const res = await socialDAC.follow(userID ?? (await getUserID()));
  console.log(`Success: ${res.success}`);
  console.log(`Error (if unsuccessful): ${res.error}`);
  return res;
};
export const unfollow = async (userID) => {
  const socialDAC = await getSocialDAC();
  const res = await socialDAC.unfollow(userID ?? (await getUserID()));
  console.log(`Success: ${res.success}`);
  console.log(`Error (if unsuccessful): ${res.error}`);
  return res;
}; // ### Published Apps Functionality ###

export const getPublishedApp = async (appId) => {
  let publishedAppJSON = await getJSONfromIDB(appId, {
    store: IDB_STORE_SKAPP,
  });
  return publishedAppJSON;
};

export const getMyPublishedApps = async () => {
  //let publishedAppsMap = new Map();
  let publishedAppsMap = [];
  try {
    let { data: publishedAppsIdList } = await getFile_MySky(DK_PUBLISHED_APPS, {
      store: IDB_STORE_SKAPP,
    });
    if (publishedAppsIdList) {
      await Promise.all(
        publishedAppsIdList.map(async (appId) => {
          const resultObj = await getFile_MySky(appId, {
            store: IDB_STORE_SKAPP,
          });
          publishedAppsMap.push(resultObj.data);
          try {
            // const contentDAC = await getContentDAC();
            // await contentDAC.recordInteraction({skylink: resultObj.dataLink,metadata: {contentType: "skapp",contentSubType: "publishedApp",skappID: appId,action: "view",},});
    } catch (e) {
      console.log("content record failed: e" + e);
    }
  })
      );
      //console.log("getMyPublishedApps: " + publishedAppsMap);
    }
  } catch (err) {
  console.log(err);
  return publishedAppsMap;
}
return publishedAppsMap;
};

//Update published app and returns list of all Published apps by loggedin User.
export const publishApp = async (appJSON) => {
  //let publishedAppsIdList = await getFile_MySky( DK_PUBLISHED_APPS, { store: IDB_STORE_SKAPP });
  let { data: publishedAppsIdList } = await getFile_MySky(DK_PUBLISHED_APPS, {
    skydb: true,
  });
  let firstTime = false;
  if (publishedAppsIdList) {
    if (!publishedAppsIdList.includes(appJSON.id)) {
      // update Index value
      publishedAppsIdList.push(appJSON.id);
      firstTime = true;
    }
  } else {
    publishedAppsIdList = [appJSON.id];
  }
  // update Index value
  await putFile_MySky(DK_PUBLISHED_APPS, publishedAppsIdList, {
    store: IDB_STORE_SKAPP,
  });
  // update existing published app
  // add additional logic to link previously published App
  const resultObj = await putFile_MySky(appJSON.id, appJSON, {
    store: IDB_STORE_SKAPP,
  });
  try {
    await emitEvent(await getUserID(), appJSON.id, EVENT_PUBLISHED_APP);
  } catch (e) {
    console.log("emitEvent failed: e" + e);
  }
  try {
    // const contentDAC = await getContentDAC();
    if (firstTime) {
      // await contentDAC.recordNewContent({ skylink: resultObj.dataLink, metadata: {contentType: "skapp", contentSubType: "publishedApp",skappID: appJSON.id,action: "created", },});
  } else {
    // await contentDAC.recordNewContent({
  //   skylink: resultObj.dataLink,
  //     metadata: {
  //     contentType: "skapp",
  //       contentSubType: "publishedApp",
  //         skappID: appJSON.id,
  //           action: "updated",
  //       },
  // });
}
  } catch (e) {
  console.log("content record failed: e" + e);
}
const publishedAppsMap = await getMyPublishedApps();
//await addToSkappUserFollowing(userPubKey);
//await addToSharedApps(userPubKey, appJSON.id);
return publishedAppsMap;
};

export const republishApp = async (appJSON) => {
  let { data: publishedAppsIdList } = await getFile_MySky(DK_PUBLISHED_APPS, {
    store: IDB_STORE_SKAPP,
  });
  // check if appid is present in publishedAppsIdList.
  if (publishedAppsIdList && !publishedAppsIdList.includes(appJSON.id)) {
    // update Index value
    await putFile_MySky(DK_PUBLISHED_APPS, publishedAppsIdList, {
      store: IDB_STORE_SKAPP,
    });
    // update existing published app
    // add additional logic to link previously published App
    const resultObj = await putFile_MySky(appJSON.id, appJSON, {
      store: IDB_STORE_SKAPP,
    });
    try {
      // const contentDAC = await getContentDAC();
      // await contentDAC.recordNewContent({
    //   skylink: resultObj.dataLink,
    //     metadata: {
    //     contentType: "skapp",
    //       contentSubType: "publishedApp",
    //         skappID: appJSON.id,
    //           action: "updated",
    //     },
    // });
  } catch (e) {
    console.log("content record failed: e" + e);
  }
  try {
    await emitEvent(await getUserID(), appJSON.id, EVENT_PUBLISHED_APP);
  } catch (e) {
    console.log("emitEvent failed: e" + e);
  }
  //await addToSkappUserFollowing(userPubKey);
  //await addToSharedApps(userPubKey, appJSON.id);
} else {
  console.log(
    "app is not published. first publish app, then only you can EDIT app"
  );
  }
const publishedAppsMap = await getMyPublishedApps();
return publishedAppsMap;
};
export const installApp = async (appJSON) => {
  let { data: installedAppsIdList } = await getFile_MySky(DK_INSTALLED_APPS, {
    store: IDB_STORE_SKAPP,
  });
  let firstTime = false;
  if (installedAppsIdList) {
    //app should not already be installed
    if (!installedAppsIdList.includes(appJSON.id)) {
      installedAppsIdList.push(appJSON.id);
      firstTime = true;
    } else {
      const installedAppsMap = await getMyInstalledApps();
      //await addToSkappUserFollowing(userPubKey);
      //await addToSharedApps(userPubKey, appJSON.id);
      return installedAppsMap;
    }
  } else {
    installedAppsIdList = [appJSON.id];
  }
  // update Index value
  await putFile_MySky(DK_INSTALLED_APPS, installedAppsIdList, {
    store: IDB_STORE_SKAPP,
  });
  // update existing published app
  // add additional logic to link previously published App

  const resultObj = await putFile_MySky(`${appJSON.id}#installed`, appJSON, {
    store: IDB_STORE_SKAPP,
  });
  try {
    // const contentDAC = await getContentDAC();
    // await contentDAC.recordNewContent({
  //   skylink: resultObj.dataLink,
  //     metadata: {
  //     contentType: "skapp",
  //       contentSubType: "pinned",
  //         skappID: appJSON.id,
  //           action: "created",
  //     },
  // });
} catch (e) {
  console.log("content record failed: e" + e);
}
try {
  await emitEvent(await getUserID(), appJSON.id, EVENT_APP_INSTALLED);
} catch (e) {
  console.log("emitEvent failed: e" + e);
}
const installedAppsMap = await getMyInstalledApps();
//await addToSkappUserFollowing(userPubKey);
//await addToSharedApps(userPubKey, appJSON.id);
return installedAppsMap;
};

export const uninstallApp = async (appId) => {
  let { data: installedAppsIdList } = await getFile_MySky(DK_INSTALLED_APPS, {
    store: IDB_STORE_SKAPP,
  });
  if (installedAppsIdList) {
    //app should already be installed for uninstall
    if (installedAppsIdList.includes(appId)) {
      installedAppsIdList.splice(installedAppsIdList.indexOf(appId), 1);
      //set updated list
      await putFile_MySky(DK_INSTALLED_APPS, installedAppsIdList, {
        store: IDB_STORE_SKAPP,
      });
      // update existing published app
      // add additional logic to link previously published App// set empty value
      const resultObj = await putFile_MySky(
        `${appId}#installed`,
        {},
        { store: IDB_STORE_SKAPP }
      );
      try {
        // const contentDAC = await getContentDAC();
        // await contentDAC.recordNewContent({
      //   skylink: resultObj.dataLink,
      //     metadata: {
      //     contentType: "skapp",
      //       contentSubType: "pinned",
      //         skappID: appId,
      //           action: "removed",
      //     },
      // });
    } catch (e) {
      console.log("content record failed: e" + e);
    }
    try {
      await emitEvent(await getUserID(), appId, EVENT_APP_UNINSTALLED);
    } catch (e) {
      console.log("emitEvent failed: e" + e);
    }
  }
}
const installedAppsMap = await getMyInstalledApps();
//await addToSkappUserFollowing(userPubKey);
//await addToSharedApps(userPubKey, appJSON.id);
return installedAppsMap;
};

export const getMyInstalledApps = async () => {
  //let publishedAppsMap = new Map();
  let installedAppsMap = [];
  try {
    let { data: installedAppsIdList } = await getFile_MySky(DK_INSTALLED_APPS, {
      store: IDB_STORE_SKAPP,
    });
    if (installedAppsIdList) {
      await Promise.all(
        installedAppsIdList.map(async (appId) => {
          const resultObj = await getFile_MySky(`${appId}#installed`, {
            store: IDB_STORE_SKAPP,
          });
          installedAppsMap.push(resultObj.data);
          try {
            // const contentDAC = await getContentDAC();
            // await contentDAC.recordInteraction({
          //   skylink: resultObj.dataLink,
          //     metadata: {
          //     contentType: "skapp",
          //       contentSubType: "pinned",
          //         skappID: appId,
          //           action: "view",
          //     },
          // });
    } catch (e) {
      console.log("content record failed: e" + e);
    }
  })
      );
console.log("getMyInstalledAppsMap: " + installedAppsMap);
    }
  } catch (err) {
  console.log(err);
  return installedAppsMap;
}
return installedAppsMap;
};

export const setAppStatsEvent = async (statsEventType, appId) => {
  let appStatsStr = "0#0#0#0#0"; // View#access#likes#fav
  let userID = (await getUserID()) ?? ANONYMOUS; // ANONYMOUS : user is not loggedIn
  let appStatsList = null;
  let resultObj = null;
  try {
    // Get Data from IDX-DB
    //appStatsJSON = await getFile_MySky(`${appId}#stats`, { store: IDB_STORE_SKAPP, });
    if (userID != ANONYMOUS) {
      // STEP1: get current value from Users Storage
      // let appStatsEntry = await getRegistryEntry(getUserPublicKey(), `${appId}#stats`, { store: IDB_STORE_SKAPP, });
      // appStatsStr = appStatsEntry?.data ?? "0#0#0#0";// View#access#likes#fav
      resultObj = await getFile_MySky(`${appId}#stats`, {
        store: IDB_STORE_SKAPP,
      });
      appStatsStr = resultObj?.data?.stats ?? "0#0#0#0#0"; // View#access#likes#fav
      //{ views: parseInt(appStatsList[0]), access: parseInt(appStatsList[1]), likes: parseInt(appStatsList[2]), favorites: parseInt(appStatsList[3]) }
    }
    appStatsList = appStatsStr.split("#");
    // const contentDAC = await getContentDAC();
    switch (statsEventType) {
      case EVENT_APP_VIEWED:
        appStatsList[0] = parseInt(appStatsList[0]) + 1;
        try {
          // await contentDAC.recordInteraction({
        //   skylink: resultObj?.dataLink,
        //     metadata: {
        //     contentType: "skapp",
        //       contentSubType: "published",
        //         skappID: appId,
        //           action: "viewed",
        //     },
        // });
    } catch (e) {
      console.log("content record failed: e" + e);
    }
    break;
      case EVENT_APP_ACCESSED:
appStatsList[1] = parseInt(appStatsList[1]) + 1;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "accessed",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      case EVENT_APP_LIKED:
appStatsList[2] = 1;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "liked",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      case EVENT_APP_LIKED_REMOVED:
appStatsList[2] = 0;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "unliked",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      case EVENT_APP_FAVORITE:
appStatsList[3] = 1;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "favorite",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      case EVENT_APP_FAVORITE_REMOVED:
appStatsList[3] = 0;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "unfavorite",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      case EVENT_APP_INSTALLED:
appStatsList[4] = 1;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "pinned",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      case EVENT_APP_UNINSTALLED:
appStatsList[4] = 0;
try {
  // await contentDAC.recordInteraction({
//   skylink: resultObj?.dataLink,
//     metadata: {
//     contentType: "skapp",
//       contentSubType: "published",
//         skappID: appId,
//           action: "unpinned",
//             },
// });
        } catch (e) {
  console.log("content record failed: e" + e);
}
break;
      default:
console.log("In Dafault loop: " + statsEventType);
break;
    }
if (userID != ANONYMOUS) {
  //await setRegistryEntry(`${appId}#stats`, appStatsList.join("#"), { store: IDB_STORE_SKAPP, });
  await putFile_MySky(
    `${appId}#stats`,
    { stats: appStatsList.join("#") },
    { store: IDB_STORE_SKAPP }
  );
}
// EMIT EVent on GEQ
try {
  await emitEvent(await getUserID(), appId, statsEventType);
} catch (e) {
  console.log("emitEvent failed: e" + e);
}
  } catch (err) {
  console.log(err);
  return appStatsList;
}
return appStatsList;
};

// pass list of appIds to get AppStats. Fav, Viewed, liked, accessed
export const getAppStats = async (appId) => {
  // Get Data from IDX-DB
  //let appStatsObj = await getJSONfromIDB(`${appId}#stats`, { store: IDB_STORE_SKAPP, });
  // let appStatsStr = (appStatsObj && appStatsObj[1]) ?? "0#0#0#0"
  // let appStatsList = appStatsStr.split("#"); // View#access#likes#fav
  let resultObj = await getFile_MySky(`${appId}#stats`, {
    store: IDB_STORE_SKAPP,
  });
  //let appStatsObj = await getRegistryEntry(getUserPublicKey(), `${appId}#stats`);
  try {
    // const contentDAC = await getContentDAC();
    // await contentDAC.recordInteraction({
  //   skylink: resultObj.dataLink,
  //     metadata: {
  //     contentType: "skapp",
  //       contentSubType: "published",
  //         skappID: appId,
  //           action: "statsViewed",
  //     },
  // });
} catch (e) {
  console.log("content record failed: e" + e);
}
let appStatsList = (resultObj?.data?.stats ?? "0#0#0#0#0").split("#");
return appStatsList;
};

// get apps comments -
export const setAppComment = async (appId, comment) => {
  let commentObj = {
    timestamp: new Date(),
    comment,
  };
  let appCommentsJSON = await getJSONfromIDB(`${appId}#appComments`, {
    store: IDB_STORE_SKAPP,
  });
  if (appCommentsJSON === null) {
    //If null or empty
    // TODO: create and return new empty stats object
  }
  appCommentsJSON.content.comments.push(commentObj);
  const resultObj = await setJSONinIDB(`${appId}appComments`, appCommentsJSON, {
    store: IDB_STORE_SKAPP,
  });
  try {
    // const contentDAC = await getContentDAC();
    // await contentDAC.recordNewContent({
  //   skylink: resultObj.dataLink,
  //     metadata: {
  //     contentType: "skapp",
  //       contentSubType: "comments",
  //         skappID: appId,
  //           action: "created",
  //     },
  // });
} catch (e) {
  console.log("content record failed: e" + e);
}
};

// pass list of appIds to get App Comments.
export const getAppComments = async (appId) => {
  let appCommentsJSON = await getJSONfromIDB(`${appId}#appComments`, {
    store: IDB_STORE_SKAPP,
  });
  return appCommentsJSON;
};

//action for upload videos and images
export const UploadAppLogo = async (
  file,
  setLogoUploaded,
  logoLoaderHandler
) => {
  try {
    const getCompressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 256,
      useWebWorker: true,
    });
    const skylinkForCompressed = await uploadFile(getCompressed);
    const skylink = await uploadFile(file);
    let obj = {
      thumbnail: skylinkForCompressed.skylink,
      image: skylink.skylink,
    };
    setLogoUploaded(obj);
    logoLoaderHandler(false);
  } catch (err) {
    logoLoaderHandler(false);
  }
};

export const UploadImagesAction = async (file, getUploadedFile, getFun) => {
  try {
    const getCompressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 256,
      useWebWorker: true,
    });

    const skylinkForCompressed = await uploadFile(getCompressed);

    const skylink = await uploadFile(file);

    let obj = {
      thumbnail: skylinkForCompressed.skylink,
      image: skylink.skylink,
    };

    getUploadedFile(obj);
    getFun(false);
  } catch (err) {
    getFun(false);
    console.log(err);
  }
};

export const UploadVideoAction = async (
  file,
  thumb,
  getUploadedFile,
  videoUploadLoader
) => {
  try {
    const skylinkForCompressed = await uploadFile(thumb);

    const skylink = await uploadFile(file);

    let obj = {
      thumbnail: skylinkForCompressed.skylink,
      video: skylink.skylink,
    };

    getUploadedFile(obj);
    videoUploadLoader(false);
  } catch (err) {
    videoUploadLoader(false);
    console.log(err);
  }
};

// ### AppStore Functionality ###

// Returns all Apps data(JSON) from List of Devs I am Following
export const getMyAppStore = () => { };

// Returns all Apps data(JSON) from "Skapp Developer"
export const getDefaultAppStore = () => { };

// ### Hosting Functionality ###

// get my all hosted apps. Returns List of JSONS
/**
 *
 * @param { Array } appIds[] Optional. Do not pass argument to get only the list of IDs. Pass a blank array to get list of all hosted apps.
 * Pass array with values in it get app list of the provided hosted apps.
 *
 *
 */
export const getMyHostedApps = async (appIds) => {
  const hostedAppIdList = { appIdList: [], appDetailsList: {} };
  try {
    if (appIds == null || appIds.length === 0) {
      let { data } = await getFile_MySky(DK_HOSTED_APPS, {
        store: IDB_STORE_SKAPP,
      });
      hostedAppIdList.appIdList = data;
      appIds = appIds?.length === 0 ? data : appIds;
    }
    appIds?.length > 0 &&
      (await Promise.all(
        appIds.map(async (appId) => {
          const resultObj = await getFile_MySky(`${appId}#hosted`, {
            store: IDB_STORE_SKAPP,
          });
          hostedAppIdList.appDetailsList[appId] = resultObj.data;
          try {
            // const contentDAC = await getContentDAC();
            // await contentDAC.recordInteraction({
          //   skylink: resultObj.dataLink,
          //     metadata: {
          //     contentType: "skapp",
          //       contentSubType: "hosted",
          //         skappID: appId,
          //           action: "viewed",
          //     },
          // });
  } catch (e) {
    console.log("content record failed: e" + e);
  }
})
      ));
return hostedAppIdList;
  } catch (err) {
  console.log(err);
}
};

//Update published app data
export const setMyHostedApp = async (appJSON, previousId) => {
  const hostedAppIdList = (await getMyHostedApps())?.appIdList || [];
  const ts = new Date().getTime();
  let history = {};
  history[ts] = appJSON.skylink;
  const id = previousId ? previousId : generateSkappId();
  let appVersion = "1";
  let previousApp;
  if (previousId) {
    previousApp = (await getMyHostedApps([previousId])).appDetailsList[
      previousId
    ];
    appVersion = parseInt(previousApp.version) + 1;
    history = { ...previousApp.content.history, ...history };
  }
  const hostedAppJSON = {
    $type: "skapp",
    $subType: "hosted",
    createdTs: previousApp ? previousApp.createdTs : ts,
    id,
    version: appVersion,
    prevSkylink: previousApp ? previousApp.content.skylink : null,
    content: {
      ...appJSON,
      history,
    },
    ts,
  };
  //alert("previousId" + previousId);
  const resultObj = await putFile_MySky(`${id}#hosted`, hostedAppJSON, {
    store: IDB_STORE_SKAPP,
  });
  try {
    // const contentDAC = await getContentDAC();
    // const status = await contentDAC.recordNewContent({
    //   skylink: resultObj.dataLink,
    //   metadata: {
    //     contentType: "skapp",
    //     contentSubType: "hosted",
    //     skappID: appJSON.id,
    //     action: "created",
    //   },
    // });
  } catch (e) {
    console.log("content record failed: e" + e);
  }
  if (previousId === "" || previousId === null || previousId === undefined) {
    //alert("adding in array" + previousId);
    await putFile_MySky(DK_HOSTED_APPS, [...hostedAppIdList, id], {
      store: IDB_STORE_SKAPP,
    });
  }
  return hostedAppJSON;
};

export const deleteMyHostedApp = async (appId) => {
  let status = false;
  try {
    const hostedAppIdList = (await getMyHostedApps())?.appIdList || [];
    hostedAppIdList.splice(hostedAppIdList.indexOf(appId), 1);
    const resultObj = await putFile_MySky(
      `${appId}#hosted`,
      {},
      { store: IDB_STORE_SKAPP }
    );
    try {
      // const contentDAC = await getContentDAC();
      // await contentDAC.recordNewContent({
    //   skylink: resultObj.dataLink,
    //     metadata: {
    //     contentType: "skapp",
    //       contentSubType: "hosted",
    //         skappID: appId,
    //           action: "removed",
    //     },
    // });
  } catch (e) {
    console.log("content record failed: e" + e);
  }
  await putFile_MySky(DK_HOSTED_APPS, [...hostedAppIdList], {
    store: IDB_STORE_SKAPP,
  });
  status = true;
} catch (e) {
  console.log("deleteMyHostedApp : Error deleting  = " + appId);
}
return status;
};

//set HNS Entry. Everytime app is deployed this method must be called. else handshake name wont be updated with new skylink
export const setHNSEntry = (hnsName, skylink) => { };

//get HNS URL for TXT record
//export const getHNSSkyDBURL = (hnsName) => getRegistryEntryURL(getUserPublicKey(), hnsName);
export const getHNSSkyDBURL = async (hnsName) =>
  getRegistryEntryURL(await getUserID(), hnsName);

export const initializeLocalDatabaseFromBackup = async () => {
  try {
  } catch (e) { }
};

export const backupLocalDatabaseOnSkyDB = async () => {
  try {
  } catch (e) { }
};

// export const getUserProfile = async (userSession) => {
//   await userProfileDacTest(userSession)
//   /// LoadDac
//   // let profileJSON = await getFile(session, SKYID_PROFILE_PATH);
//   let userProfileObj = createDummyUserProfileObject();
//   //userProfileObj.userID = userID;
//   //await getContentDAC().recordNewContent({skylink: resultObj.dataLink,metadata: {"contentType":"skapp","contentSubType":"hosted","skappID":appJSON.id,"action":"removed"}});
//   //TODO: KUSHAL - call userprofile DAC

//   //const response = await getFile(session.mySky.userID, SKYID_PROFILE_PATH, { skydb: true })
//   // if (response == "" || response == undefined) {
//   //   // file not found
//   //   console.log("Profile not found;, please check your connection and retry")
//   // } else {
//   //   // success
//   //   //let temp = JSON.stringify(response);
//   //   let skyIdProfileObj = JSON.parse(response);
//   //   const { publicKey, privateKey } = snKeyPairFromSeed(session.skyid.seed)
//   //   personObj = {
//   //     masterPublicKey: session.skyid.userId, // public key derived from "master seed". we pull profile using this public key
//   //     appSeed: session.skyid.seed, // App specific seed derived from "Master Seed"
//   //     appId: session.skyid.appId,
//   //     appImg: session.skyid.appImg,
//   //     appPublicKey: publicKey,
//   //     appPrivateKey: privateKey,
//   //     profile: {
//   //       username: skyIdProfileObj.username, // user name is associated with master Key
//   //       did: skyIdProfileObj.username, // this is place holder for Decentralized Id (DID)
//   //       aboutme: skyIdProfileObj.aboutMe,
//   //       location: skyIdProfileObj.location,
//   //       avatar: skyIdProfileObj.avatar,
//   //       profilePicture: skyIdProfileObj.profilePicture,
//   //     },
//   //   }
//   // }
//   return userProfileObj
// }

//#################### SkyDB Methods #########################
// After SKAPP DAC is integrated, move this methods to DAC setter and getter methods
//########################################################
export const getAllPublishedApps = async (sortOn, orderBy, resultCount) => {
  console.log(
    " ########################### getAllPublishedApps : sortOn " +
    sortOn +
    " : orderBy " +
    orderBy
  );
  // TODO: Check Sorting in App stats first and then load remaining appIDs
  //let publishedAppsMap = new Map();
  let allPublishedApps = [];
  try {
    // april 25th
    // let publishedAppsIdList = await getFile(getProviderKeysByType("AGGREGATOR").publicKey, DK_PUBLISHED_APPS, { store: IDB_STORE_SKAPP_AGGREGATED_DATA });
    //let publishedAppsIdList = await getFile(null, DK_PUBLISHED_APPS, { store: IDB_STORE_SKAPP_AGGREGATED_DATA, publicKey: getProviderKeysByType("AGGREGATOR").publicKey });
    let { data: publishedAppsIdList } = await getFile_SkyDB(getProviderKeysByType("AGGREGATOR").publicKey, DK_AGGREGATED_PUBLISHED_APPS);
    let result = await getFile_SkyDB(getProviderKeysByType("AGGREGATOR").publicKey, DK_AGGREGATED_PUBLISHED_APPS_STATS);
    console.log(" ########################### getAllPublishedApps :  " + publishedAppsIdList.length);
    console.log(" ########################### getAllPublishedApps :  " + JSON.stringify(result.data));
    let publishedAppsStatsList = result?.data;
    if (publishedAppsIdList) {
      await Promise.all(publishedAppsIdList.map(async (pubkeyAndAppId) => {
        let temp = pubkeyAndAppId.split('#'); //userID#appId
        //let appJSON = await getFile(null, temp[1], { store: IDB_STORE_SKAPP_AGGREGATED_DATA, publicKey: temp[0]})// TODO: need to fix IDB store
        let { data: appJSON, dataLink } = await getFile_MySky(temp[1], { userID: temp[0] });
        try {
          // const contentDAC = await getContentDAC();
          // await contentDAC.recordNewContent({ skylink: dataLink, metadata: { "contentType": "skapp", "contentSubType": "published", "skappID": temp[1], "action": "viewed" } });
        } catch (e) {
          console.log("content record failed: e" + e);
        }
        if (appJSON) {
          // if no appJSON found in user SkyDB, skip and move on to next appId
          // Read appStats from Aggregator Storage and update AppJSON
          let appStats = "0#0#0#0#0";
          let appStatsList = [];
          try {
            //let tempEntry = await getRegistryEntry(getProviderKeysByType("AGGREGATOR").publicKey, temp[1] + "#stats");
            //console.log("### getAllPublishedApps :: Aggregated publishedAppsStatsList  "+publishedAppsStatsList)
            appStats =
              publishedAppsStatsList?.appStatsList[appJSON.id] ?? "0#0#0#0#0";
            //console.log("### getAllPublishedApps :: Aggregated publishedAppsStatsList  "+JSON.stringify(publishedAppsStatsList ?? {}))
            appStatsList = appStats.split("#");
            // View#access#likes#fav
            appJSON.content.appstats = {
              views: parseInt(appStatsList[0]),
              access: parseInt(appStatsList[1]),
              likes: parseInt(appStatsList[2]),
              favorites: parseInt(appStatsList[3]),
              installed: parseInt(appStatsList[4]),
            };
          } catch (e) {
            console.log("getAllPublishedApps: e " + e);
          }
          // let appStats = "0#0#0#0";
          // let appStatsList = [];
          // try {
          //   let tempEntry = await getRegistryEntry(getProviderKeysByType("AGGREGATOR").publicKey, temp[1] + "#stats");
          //   appStats = tempEntry ? tempEntry.data : "0#0#0#0";
          //   appStatsList = appStats.split('#');
          //   // View#access#likes#fav
          //   appJSON.content.appstats = { views: parseInt(appStatsList[0]), access: parseInt(appStatsList[1]), likes: parseInt(appStatsList[2]), favorites: parseInt(appStatsList[3]) };
          // } catch (e) {
          //   console.log("getAllPublishedApps: e" + e);
          // }
          allPublishedApps.push(appJSON);
        }
      })
      );
      // Sort list by specific parameter
      let iteratees = (obj) => -obj.content.appstats.access;
      switch (sortOn) {
        case "VIEWS":
          iteratees = (obj) =>
            orderBy === "ASC"
              ? obj.content.appstats.views
              : -obj.content.appstats.views;
          break;
        case "ACCESS":
          iteratees = (obj) =>
            orderBy === "ASC"
              ? obj.content.appstats.access
              : -obj.content.appstats.access;
          break;
        case "LIKES":
          iteratees = (obj) =>
            orderBy === "ASC"
              ? obj.content.appstats.likes
              : -obj.content.appstats.likes;
          break;
        case "FAVORITES":
          iteratees = (obj) =>
            orderBy === "ASC"
              ? obj.content.appstats.favorites
              : -obj.content.appstats.favorites;
          break;
        default:
          iteratees = (obj) => -obj.content.appstats.views;
          console.log("In Dafault sorting 'Views Desc' ");
          break;
      }
      allPublishedApps = _.orderBy(allPublishedApps, iteratees);
      //console.log("@@@@@@@@@@@@@@@@@ allPublishedApps " + JSON.stringify(allPublishedApps))

      if (resultCount && resultCount != 0) {
        allPublishedApps = allPublishedApps.slice(0, resultCount);
      }
      //console.log("allPublishedApps: " + allPublishedApps);
    }
  } catch (err) {
    console.log("Error in getAllPublishedApps : " + err);
    return allPublishedApps;
  }
  return allPublishedApps;
};

export const getAggregatedAppStatsByAppId = async (appId) => {
  // Get Data from IDX-DB
  let appStatsObj = await getRegistryEntry(
    getProviderKeysByType("AGGREGATOR").publicKey,
    `${appId}#stats`
  );
  // let appStatsObj = await getJSONfromIDB(`${appId}#stats`, { store: IDB_STORE_SKAPP_AGGREGATED_DATA, });
  let appStatsList = (appStatsObj?.data ?? "0#0#0#0#0").split("#"); // View#access#likes#fav
  // try {
  //   // const contentDAC = await getContentDAC();
  //   // await contentDAC.recordInteraction({skylink: resultObj.dataLink,metadata: {"contentType":"skapp","contentSubType":"published","skappID":appJSON.id,"action":"viewed"}});
  // }
  // catch (e) {
  //   console.log("content record failed: e" + e)
  // }
  return appStatsList;
};

export const getAggregatedAppStats = async (appIds) => {
  let appStatsList = { appIdList: [], appStatsList: {} };
  // get all appId from PublishedApp
  try {
    // we can improve here by pagination
    // Fetch all AppStats
    // ******* ### TODO: here we can directly pull from SkyDB ********
    appStatsList = await getFile(null, DK_AGGREGATED_PUBLISHED_APPS_STATS, {
      store: IDB_STORE_SKAPP_AGGREGATED_DATA,
      publicKey: getProviderKeysByType("AGGREGATOR").publicKey,
    });

    // if (appIds == null || appIds.length === 0) {
    //   let publishedAppsIdList = await getFile(null, DK_AGGREGATED_PUBLISHED_APPS, { store: IDB_STORE_SKAPP_AGGREGATED_DATA, publicKey: getProviderKeysByType("AGGREGATOR").publicKey });
    //   //let {data} = await getFile_MySky(DK_AGGREGATED_PUBLISHED_APPS, { store: IDB_STORE_SKAPP_AGGREGATED_DATA });
    //   appStatsList.appIdList = publishedAppsIdList;
    //   appIds = appIds?.length === 0 ? publishedAppsIdList : appIds;
    // }
    // appIds?.length > 0 && await Promise.all(appIds.map(async (userIDAndAppId) => {
    //   let temp = userIDAndAppId.split('#'); //userID#appId
    //   const aggStatsByAppID = await getFile(null, temp[1] + "#stats", { store: IDB_STORE_SKAPP_AGGREGATED_DATA, publicKey: getProviderKeysByType("AGGREGATOR").publicKey });
    //   //appStatsList.appStatsList[temp[1]] = (await getFile_MySky( `${appId}#stats`, { store: IDB_STORE_SKAPP_AGGREGATED_DATA }))?.data;
    //   appStatsList.appStatsList[temp[1]] = aggStatsByAppID;
    // }));
    return appStatsList;
  } catch (err) {
    console.log(err);
    return;
  }
};

const test_user_ids = ["570980a7f24391a9ced450cd8f22a9d78229c650ad24b7c2686b5bb86915418e",
  "3d4e50cfe857d94403c21f38be21073ecc42c7c828101e26c7628fd0b6fad67f",
  "8b8544d54ecf56da6be887232361eec9f524429c1bd523f4778b20fb9945d15c",
  "d21eb9d8d38e7b495cc47b94a046eab710edf7f1b19d42d5f1b201feb3406a2a",
  "22f91386b2e341edb046ff880a2e817b3b70fdd958113dc93b9b1375880dd5d2",
  "c25858373033e730a5e592cb5fd5b5fa90657da06210886c1f30552796973cb9",
  "73a83de68f07d77a75f3e8d7534f58c2d0a613aeffa2ec4f53238ee5af5a3379",
  "4294b7224a3d19a75abf7970f1bf3213c0370ea36d36a689cbd39e53333ec7f4",
  "5dc982eed6290fbe02f7781ec92051ef12e835a0565885eacfc94a9ee07686f0",
  "b85e1cd34633297d6004446f935d220918a8e2c5b98a5f5cc32c3c6c93f72d6b",
  "2b02efca9ed51cfed5c645eb3c1513d9343207a9e843454de72771e57c805d48",
  "403a35ed6b473518a213d514c3d105471d4bb454b67e4c4db106f061c13cb9a3",
  "dfa6e4e25be41cfe27a4457fab9a162db425cc7d230ff14370f9ae2a86f3a0ec",
  "c4b99808f188174c54edcc3cb1f2b864966911f15682d6fcdf728657c7813a30",
  "ce2df8006eb4a0179a5b1f85a59688b3749bffca91984614b40454dfa7ce3d3c"];

export const getAggregatedUserIDs = async (pageNumber) => {
  const { data: aggregatedUserIDs } = await getFile_SkyDB(
    getProviderKeysByType("AGGREGATOR").publicKey,
    DK_AGGREGATED_USERIDS
  );
  aggregatedUserIDs.push(...test_user_ids)
  console.log("###########################  aggregatedUserIDs = " + aggregatedUserIDs.length)
  return aggregatedUserIDs; // list of userIDs
};
// ### Apps Stats and comments Functionality ###

export const getUsersPublishedApps = async (userID) => {
  //let publishedAppsMap = new Map();
  let publishedAppsMap = [];
  try {
    let { data: publishedAppsIdList } = await getFile_MySky(DK_PUBLISHED_APPS, {
      userID,
      store: IDB_STORE_SKAPP,
    });
    if (publishedAppsIdList) {
      await Promise.all(
        publishedAppsIdList.map(async (appId) => {
          const resultObj = await getFile_MySky(appId, {
            userID,
            store: IDB_STORE_SKAPP,
          });
          publishedAppsMap.push(resultObj.data);
          try {
            // const contentDAC = await getContentDAC();
            // await contentDAC.recordInteraction({ skylink: resultObj.dataLink, metadata: { "contentType": "skapp", "contentSubType": "publishedApp", "skappID": appId, "action": "view" } });
          } catch (e) {
            console.log("content record failed: e" + e);
          }
        })
      );
      //console.log("getMyPublishedApps: " + publishedAppsMap);
    }
  } catch (err) {
    console.log(err);
    return publishedAppsMap;
  }
  return publishedAppsMap;
};

export const getUsersPublishedAppsCount = async (userID) => {
  //let publishedAppsMap = new Map();
  let publishedAppsMap = [];
  try {
    let result = await getFile_MySky(DK_PUBLISHED_APPS, {
      userID,
      store: IDB_STORE_SKAPP,
    });
    publishedAppsMap = result.data;
  } catch (err) {
    console.log(err);
    return 0;
  }
  return publishedAppsMap ? publishedAppsMap.length : 0;
};
