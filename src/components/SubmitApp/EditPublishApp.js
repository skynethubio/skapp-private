import React, { createRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  makeStyles,
  Grid,
  TextareaAutosize,
  Tooltip 
} from "@material-ui/core";
import Select from "react-select";
import { Add, HelpOutline } from "@material-ui/icons";
import styles from "../../assets/jss/app-details/SubmitAppStyles";
// img icon
import { ReactComponent as ImgIcon } from "../../assets/img/icons/image.svg";
import { useForm, Controller } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from 'react-redux';
// importing action
import {
  publishAppAction,
} from "../../redux/action-reducers-epic/SnPublishAppAction";
import {
  UploadImagesAction,
  UploadVideoAction,
  UploadAppLogo,
  getMyHostedApps,
} from "../../service/SnSkappService";
import TagsInput from "react-tagsinput";
import "./taginput.css"; // If using WebPack and style-loader.
import imageCompression from "browser-image-compression";
import Alert from "@material-ui/lab/Alert";
import Loader from "react-loader-spinner";
import { useParams, useHistory } from "react-router-dom";
import { setLoaderDisplay } from "../../redux/action-reducers-epic/SnLoaderAction";
import { useLoadHostedAppFromUrl } from "../../hooks/useLoadHostedAppFromUrl";
import { skylinkToUrl } from "../../utils/SnUtility";
import SnUpload from '../../uploadUtil/SnUpload';
import { UPLOAD_SOURCE_DEPLOY, UPLOAD_SOURCE_NEW_HOSTING, UPLOAD_SOURCE_NEW_HOSTING_IMG } from '../../utils/SnConstants';
import { getMyPublishedAppsAction } from "../../redux/action-reducers-epic/SnPublishAppAction";

const useStyles = makeStyles(styles);
const optionsVersion = [
  { value: "1.0", label: "1.0" },
  { value: "1.01", label: "1.01" },
  { value: "1.02", label: "1.02" },
];

const appCatOptions = [
  { value: "Social", label: "Social" },
  { value: "Video", label: "Video" },
  { value: "Pictures", label: "Pictures" },
  { value: "Music", label: "Music" },
  { value: "Productivity", label: "Productivity" },
  { value: "Utilities", label: "Utilities" },
  { value: "Games", label: "Games" },
  { value: "Blogs", label: "Blogs" },
  { value: "Software", label: "Software" },
  { value: "Livestream", label: "Livestream" },
  { value: "Books", label: "Books" },
  { value: "Marketplace", label: "Marketplace" },
  { value: "Finance", label: "Finance" },
  { value: "Portal", label: "Portal" },
];

const optionsAge = [
  { value: "18+", label: "18+" },
  { value: "general", label: "general" },
];

const appStatusOptions = [
  { value: "Alpha", label: "Alpha" },
  { value: "Beta", label: "Beta" },
  { value: "Live", label: "Live" },
];

const socialOption = [
  { value: "Discord", label: "Discord" },
  { value: "Reddit", label: "Reddit" },
  { value: "Twitter", label: "Twitter" },
  { value: "Dlink", label: "Dlink" },
];

const reactSelectStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    height: 55,
    boxShadow: 0,
    borderColor: "#D9E1EC",
    color: "#000",
    borderRadius: 8,
    "@media only screen and (max-width: 1440px)": {
      height: 50,
      // width: '100%',
      fontSize: 16,
    },
    "@media only screen and (max-width: 575px)": {
      height: 43,
      // width: '100%',
      fontSize: 14,
    },
    "&:hover": {
      borderColor: "#1DBF73",
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected ? "#1DBF73" : "#fff",
    "&:foucs": {
      backgroundColor: "#1DBF73",
    },
  }),
};

let forImagesPreview = [];
const EditPublishApp = () => {
  const [category, setCategory] = useState("");
  const [appStatus, setAppStatus] = useState("");
  const [age, setAge] = useState("");
  const dispatch = useDispatch();

  const [tags, setTags] = useState([]);
  const { register, handleSubmit, control, setValue } = useForm();
  const classes = useStyles();

  const { appId } = useParams();
  const history = useHistory();

  // state for social links according to format
  const [firstSocialLinkTitle, setfirstSocialLinkTitle] = useState("");
  const [secondSocialLinkTitle, setSecondSocialLinkTitle] = useState("");
  const [thirdSocialLinkTitle, setThirdSocialLinkTitle] = useState("");
  const [appDetail, setAppDetail] = useState({});

  const [firstSocialLink, setfirstSocialLink] = useState("");
  const [secondSocialLink, setSecondSocialLink] = useState("");
  const [thirdSocialLink, setThirdSocialLink] = useState("");

  const [videoObjt, setVideoObj] = useState({});

  const [mandatory, setMandatory] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isImageUploadFirst1, setIsImageUploadingFirst1] = useState(false);
  const [isImageUploadFirst, setIsImageUploadingFirst] = useState(false);
  const [isImageUploadSecond, setIsImageUploadingSecond] = useState(false);
  const [isImageUploadThird, setIsImageUploadingThird] = useState(false);
  const [isImageUploadFirstObj1, setIsImageUploadingFirstObj1] = useState({});
  const [isImageUploadFirstObj, setIsImageUploadingFirstObj] = useState({});
  const [isImageUploadSecondObj, setIsImageUploadingSecondObj] = useState({});
  const [isImageUploadThirdObj, setIsImageUploadingThirdObj] = useState({});


  const [appLogo, setAppLogo] = useState("");
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);

  //require
  const [isAppLogoTrue, setIsAppLogoTrue] = useState(false);
  const [isAppNameTrue, setIsAppNameTrue] = useState(false);
  const [isAppVersionTrue, setIsAppVersionTrue] = useState(false);
  const [isAppUrlTrue, setIsAppUrlTrue] = useState(false);
  const [isAppCatTrue, setIsAppCatTrue] = useState(false);
  const [isAppDetailDesTrue, setIsAppDetailDesTrue] = useState(false);

  const imgUploadEleRef = createRef();
  const imgUploadEleRef1 = createRef();
  const imgUploadEleRef2 = createRef();
  const imgUploadEleRef3 = createRef();
  const imgUploadEleRef4 = createRef();
  
  const { publishedAppsStore } = useSelector((state) => state.snPublishedAppsStore);

  useEffect(async () => {
    await dispatch(getMyPublishedAppsAction()); 
    if (publishedAppsStore) {
        let appJSON = publishedAppsStore.find(appData => appData.id === appId);
        if(appJSON) {
            await setAppDetail(appJSON);
            if (appJSON?.content) {
                const { appname, sourceCode, appUrl, previewVideo, skappLogo, demoUrl, category, age, appStatus, tags, connections, appDescription, releaseNotes } = appJSON.content;
                setValue('appname', appname);
                setValue('sourceCode', sourceCode);
                setValue('appUrl', appUrl);
                setValue('applogo', skappLogo);
                setValue('verson', appJSON.version);
                setValue("demoUrl", demoUrl);
                setAge({ label: age, value: age });
                setAppStatus({ label: appStatus, value: appStatus });
                setCategory({ label: category, value: category });
                setVideoObj(previewVideo);
                setAppLogo(skappLogo);
                setTags(tags);
               
                if (Object.keys(connections)[0]) {
                    setfirstSocialLinkTitle({value: Object.keys(connections)[0], label: Object.keys(connections)[0]});
                }
          
                if (Object.keys(connections)[1]) {
                    setSecondSocialLinkTitle({value: Object.keys(connections)[1], label: Object.keys(connections)[1]});
                }
          
                if (Object.keys(connections)[2]) {
                    setThirdSocialLinkTitle({value: Object.keys(connections)[0], label: Object.keys(connections)[2]});
                }
                setfirstSocialLink(connections[Object.keys(connections)[0]] ? connections[Object.keys(connections)[0]]: "");
                setSecondSocialLink(connections[Object.keys(connections)[1]] ? connections[Object.keys(connections)[1]] : "");
                setThirdSocialLink(connections[Object.keys(connections)[2]] ? connections[Object.keys(connections)[2]] : "");
                setValue('appDescription', appDescription);
                setValue('releaseNotes', releaseNotes);
            }
        }
    }
  }, []);

  const handleReset = () => {
    history.goBack();
  }

  //manage loader to upload images
  //form submit function
  const onSubmit = (data) => {
  console.log("🚀 ~ file: SubmitApp.js ~ line 167 ~ onSubmit ~ data", data)
    if (appLogo === "" && appDetail?.content.imgThumbnailSkylink == "") {
      setIsAppLogoTrue(true);
      // setMandatory(true);
    } else if (data.appname === "") {
      setIsAppNameTrue(true);
    } else if (data.verson === "") {
      setIsAppVersionTrue(true);
    } else if (data.appUrl === "") {
      setIsAppUrlTrue(true);
    } else if (!category) {
      setIsAppCatTrue(true);
    } else if (data.appDescription === "") {
      setIsAppDetailDesTrue(true);
    } else {
      setIsSubmit(true);
      setMandatory(true);
      dispatch(setLoaderDisplay(true))
      let obj = {
        $type: "skapp",
        $subtype: "published",
        id: appDetail?.id || uuidv4(),
        version: data.verson,
        ts: new Date().getTime(),
        content: data,
      };
      let forImagesPreviewObj = [];
      if (Object.keys(isImageUploadFirstObj1).length) {
        forImagesPreviewObj.push(isImageUploadFirstObj1);
      } 
      if (Object.keys(isImageUploadFirstObj).length) {
        forImagesPreviewObj.push(isImageUploadFirstObj);
      } 
      if (Object.keys(isImageUploadSecondObj).length) {
        forImagesPreviewObj.push(isImageUploadSecondObj);
      } 
      if (Object.keys(isImageUploadThirdObj).length) {
        forImagesPreviewObj.push(isImageUploadThirdObj);
      } 
      let imagesPrevieObj = {
        aspectRatio: 0.5625,
        images: forImagesPreviewObj,
      };
      obj.content.skappLogo = appLogo;
      obj.content.category = category && category.value ? category.value : "";
      obj.content.defaultPath = "index.html or EMPTY";
      obj.content.age = age && age.value ?  age.value : "";
      obj.content.previewVideo = videoObjt;
      obj.content.appStatus = appStatus && appStatus.value ? appStatus.value : "";
      obj.content.tags = tags;
      obj.content.previewImages = imagesPrevieObj;
      obj.content.history = ["list of skylinks"];
      obj.content.supportDetails = "";

      obj.content.connections = {
        [firstSocialLinkTitle && firstSocialLinkTitle.value ? firstSocialLinkTitle.value: "" ]: firstSocialLink,
        [secondSocialLinkTitle && secondSocialLinkTitle.value ? secondSocialLinkTitle.value : ""]: secondSocialLink,
        [thirdSocialLinkTitle && thirdSocialLinkTitle.value ? thirdSocialLinkTitle.value: ""]: thirdSocialLink,
      };

      dispatch(publishAppAction(obj));
      setMandatory(false);
      setIsSubmit(false);
      history.goBack();
    }
  };

  const getUploadedFile = (file) => {
    forImagesPreview.push(file);
  };

  const [isVideoUploaded, setIsVideoUploaded] = useState(false);

  //manage loader for videoUpload
  const videoUploadLoader = (val) => {
    setIsVideoUploaded(val);
  };

  //manage image upload loaders

  const firstImageLoader = (val) => {
    setIsImageUploadingFirst(val);
  };

  const secondImageLoader = (val) => {
    setIsImageUploadingSecond(val);
  };

  const thirdImageLoader = (val) => {
    setIsImageUploadingThird(val);
  };

  //for uploading images and videos
  const onChangeHandlerForImages = (file, id) => {
    if (id === "img1") {
      setIsImageUploadingFirst(true);
    } else if (id === "img2") {
      setIsImageUploadingSecond(true);
    } else {
      setIsImageUploadingThird(true);
    }

    var image = document.getElementById(id);
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (oFREvent) {
      var img = document.createElement("img");
      img.setAttribute("width", "100%");
      img.setAttribute("height", "160px");
      image.append(img);
      img.src = oFREvent.target.result;
    };

    UploadImagesAction(file, getUploadedFile, 
      id === "img1"
        ? firstImageLoader
        : id === "img2"
          ? secondImageLoader
          : thirdImageLoader
    );
  };

  //
  const getUploadVideoFile = (file) => {
    setVideoObj(file);
  };

  const onChangeHandlerForVideos = (file) => {
    var fileReader = new FileReader();
    setIsVideoUploaded(true);
    fileReader.onload = function () {
      var blob = new Blob([fileReader.result], { type: file.type });
      var url = URL.createObjectURL(blob);
      var video = document.createElement("video");
      var timeupdate = function () {
        if (snapImage()) {
          video.removeEventListener("timeupdate", timeupdate);
          video.pause();
        }
      };
      video.addEventListener("loadeddata", function () {
        if (snapImage()) {
          video.removeEventListener("timeupdate", timeupdate);
        }
      });
      var snapImage = async function () {
        var canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        var image = canvas.toDataURL();

        const thumb = await imageCompression.canvasToFile(canvas, "image/jpeg");

        
        UploadVideoAction(file, thumb, getUploadVideoFile, videoUploadLoader)
        
        var success = image.length > 100000;
        if (success) {
          var img = document.createElement("img");
          img.src = image;
          document.getElementById("vid").appendChild(img);
          URL.revokeObjectURL(url);
        }
        return success;
      };
      video.addEventListener("timeupdate", timeupdate);
      video.preload = "metadata";
      video.src = url;
      // Load video in Safari / IE11
      video.muted = true;
      video.playsInline = true;
      video.play();
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleImgUpload = (obj) => {
   let newObj = {
      thumbnail: obj.thumbnail,
      image: obj.skylink,
    };
    setAppLogo(newObj);
    setIsLogoUploaded(false);
    // formik.setFieldValue("imgSkylink", obj.skylink, true);
    // formik.setFieldValue("imgThumbnailSkylink", obj.thumbnail, true)
  };

  const handleFirstImageUpload = (obj) => {
    setIsImageUploadingFirstObj(obj);
    forImagesPreview.push(obj);
    setIsImageUploadingFirst(false);
  };
  const handleFirst1ImageUpload = (obj) => {
    setIsImageUploadingFirstObj1(obj);
    forImagesPreview.push(obj);
    setIsImageUploadingFirst1(false);
  };
  const handleSecondImageUpload = (obj) => {
    setIsImageUploadingSecondObj(obj);
    forImagesPreview.push(obj);
    setIsImageUploadingSecond(false);
  };

  const handleThirdImageUpload = (obj) => {
    setIsImageUploadingThirdObj(obj)
    forImagesPreview.push(obj);
    setIsImageUploadingThird(false);
  };

  const handleDropZoneClick = (evt, dropZoneRef) => {
    evt.preventDefault();
    evt.stopPropagation();
    // setIsLogoUploaded(true);
    dropZoneRef.current.gridRef.current.click();
  };
  
  // get

  return (
    <Box>
      {mandatory ? <Alert severity="error">Fill all fields!</Alert> : null}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginTop="7px"
      >
        <h1 className={classes.h1}>Edit Publish App</h1>
        <Box className={classes.btnBox}>
          <Button className={classes.cancelBtn} onClick={handleReset}> Cancel </Button>
          <Button
            disabled={isSubmit}
            className={classes.submitBtn}
            onClick={handleSubmit(onSubmit)}
          >
            <Add />
            {isSubmit ? (
              <Loader type="Oval" color="#FFFFFF" height={15} width={15} />
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      </Box>

      <Box component="form">
        <Box>
          <label className={classes.label}>Site Logo</label>
          <div className="d-none">
            <SnUpload
                name="files"
                source={UPLOAD_SOURCE_NEW_HOSTING_IMG}
                ref={imgUploadEleRef}
                directoryMode={false}
                onUpload={(e) => handleImgUpload(e)}
                uploadStarted={(e) => setIsLogoUploaded(e)}
            />
          </div>
          <div className={classes.siteLogo} onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef)} >
            {!isLogoUploaded && !Object.keys(appLogo).length && !appDetail && <Box style={{ flexDirection: "column", justifyItems: 'center' }}> 
              <Box style={{ position: "relative", textAlign: 'center' }}>
                <ImgIcon />
              </Box> 
              <Box style={{ position: "relative", color: "grey", textAlign: 'center' }}>click to upload Image</Box> 
              </Box>}
            { !isLogoUploaded && (Object.keys(appLogo).length || Object.keys(appDetail).length) ? <img
                alt="app"
                src={skylinkToUrl(appLogo?.thumbnail || appDetail?.content.skappLogo.thumbnail)}
                style={{
                    width: "100%",
                    height: "160px",
                    // border: props.arrSelectedAps.indexOf(app) > -1 ? "2px solid #1ed660" : null,
                }}
                onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef)}
                name="1"
              /> : null 
            }
            { isLogoUploaded && (
              <Loader
                type="Oval"
                color="#57C074"
                height={50}
                width={50}
              />
            )}
          </div>
          <div className={classes.inputGuide}>
            Max. size of 5 MB in: JPG or PNG. 300x500 or larger recommended
          </div>
          <input type="text" hidden />
        </Box>
        {isAppLogoTrue && (
          <div className="required-field">This field is required</div>
        )} 
        <Box
          display="flex"
          className={`${classes.formRow} ${classes.formRow1}`}
        >
          <Box
            className={`${classes.inputContainer} ${classes.max33}`}
            flex={1}
          >
            <label>App Name <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <input
              className={classes.input}
              placeholder="Skylink"
              name="appname"
              ref={register}
            />
            {isAppNameTrue && (
              <div className="required-field">This field is required</div>
            )}
          </Box>
          <Box className={`${classes.inputContainer} ${classes.max33}`} flex={1}>
            <label>App URL(Skylink) <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <input
              name="appUrl"
              ref={register}
              className={classes.input}
              placeholder="https://[hns name].hns"
            />
            {isAppUrlTrue && (
              <div className="required-field">This field is required</div>
            )}
          </Box>
          <Box className={`${classes.inputContainer}`} flex={1}>
            <label>App Version <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <input
              name="verson"
              ref={register}
              className={classes.input}
              placeholder="Version"
            />
            { isAppVersionTrue && (
              <div className="required-field">This field is required</div>
            )}
          </Box>
          <Box className={`${classes.inputContainer} ${classes.selectVersion}`}>
            <label>App Status <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <Box>
              <Select
                ref={register}
                name="appStatus"
                value={appStatus}
                defaultValue={appStatus}
                onChange={(e)=> setAppStatus(e)}
                options={appStatusOptions}
                styles={reactSelectStyles}
              />
            </Box>
          </Box>
        </Box>

        <Box
          display="flex"
          className={`${classes.formRow} ${classes.formRow2}`}
        >
          <Box className={`${classes.inputContainer}`}  flex={0.38}>
            <label>App Category <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <Box>
              <Select
                ref={register}
                name="category"
                defaultValue={category}
                value={category}
                onChange={(e) => setCategory(e)}
                options={appCatOptions}
                styles={reactSelectStyles}
              />
              {isAppCatTrue && (
                <div className="required-field">This field is required</div>
              )}
            </Box>
          </Box>
          <Box className={classes.inputContainerTag} flex={1}>
            <label>Custom Tags <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <TagsInput
              value={tags}
              className={`${classes.inputTag}`}
              onChange={(tags) => setTags(tags)}
            />
            {/* <input
              className={classes.input}
              name="tags"
              ref={register}
              value="Skylink"
            /> */}
          </Box>
        </Box>
        <Box
          display="flex"
          className={`${classes.formRow} ${classes.formRow2}`}
        >
           <Box className={classes.inputContainer} flex={1}>
            <label>Git URL <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <input
              name="sourceCode"
              ref={register}
              className={classes.input}
              placeholder="https://github.com"
            />
          </Box>
          <Box className={classes.inputContainer} flex={1}>
            <label>Demo URL</label>
            <input
              className={classes.input}
              name="demoUrl"
              ref={register}
              placeholder="https://www.demo.com/UJJ5Rgbu2TM"
            />
          </Box>
          <Box className={`${classes.inputContainer} ${classes.selectVersion}`}>
            <label>Age Restriction? <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
            <Box>
              <Select
                name="age"
                ref={register}
                value={age}
                defaultValue={age}
                onChange={e => setAge(e)}
                options={optionsAge}
                styles={reactSelectStyles}
              />
            </Box>
          </Box>
        </Box>
        <div className={classes.OneRowInput}>
          <div>
            <label className={classes.previewImgLabel} >
              Preview Video/Images 
              <span>
                {" "}
                Max. size of 5 MB in: JPG or PNG. 1750x900 or larger recommended
              </span> <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip>
            </label>
          </div>
          <Grid container spacing={2}>
            <Grid item md={3} sm={6} xs={6}>
              <Box style={{ position: "relative" }} className={classes.placeholderImg}>
              <div className="d-none">
                  <SnUpload
                    name="files"
                    source={UPLOAD_SOURCE_DEPLOY}
                    ref={imgUploadEleRef1}
                    directoryMode={false}
                    onUpload={(e) => handleFirst1ImageUpload(e)}
                    uploadStarted={(e) => setIsImageUploadingFirst1(e)}
                  />
                </div>
                <div className={classes.previewImg} onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef1)} >
                  {!isImageUploadFirst1 && !Object.keys(isImageUploadFirstObj1).length && <Box style={{ flexDirection: "column", justifyItems: 'center' }}> 
                      <Box style={{ position: "relative", textAlign: 'center' }}>
                        <ImgIcon />
                      </Box> 
                      <Box style={{ position: "relative", color: "grey", textAlign: 'center' }}>click to upload Image</Box> 
                      </Box>}
                  {!isImageUploadFirst1 && Object.keys(isImageUploadFirstObj1).length ? <img
                    alt="app"
                    src={skylinkToUrl(isImageUploadFirstObj1?.thumbnail)}
                    style={{
                      width: "100%",
                      height: "160px",
                      // border: props.arrSelectedAps.indexOf(app) > -1 ? "2px solid #1ed660" : null,
                    }}
                    onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef1)}
                    name="1"
                  /> : null
                  }
                  {isImageUploadFirst1 && (
                    <Loader
                      type="Oval"
                      color="#57C074"
                      height={50}
                      width={50}
                    />
                  )}
                </div>
                <input type="text" hidden />
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={6}>
            <Box style={{ position: "relative" }} 
                className={classes.placeholderImg}>
                <div className="d-none">
                  <SnUpload
                    name="files"
                    source={UPLOAD_SOURCE_DEPLOY}
                    ref={imgUploadEleRef2}
                    directoryMode={false}
                    onUpload={(e) => handleFirstImageUpload(e)}
                    uploadStarted={(e) => setIsImageUploadingFirst(e)}
                  />
                </div>
                <div className={classes.previewImg} onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef2)} >
                  {!isImageUploadFirst && !Object.keys(isImageUploadFirstObj).length && <Box style={{ flexDirection: "column", justifyItems: 'center' }}> 
                      <Box style={{ position: "relative", textAlign: 'center' }}>
                        <ImgIcon />
                      </Box> 
                      <Box style={{ position: "relative", color: "grey", textAlign: 'center' }}>click to upload Image</Box> 
                      </Box>}
                  {!isImageUploadFirst && Object.keys(isImageUploadFirstObj).length ? <img
                    alt="app"
                    src={skylinkToUrl(isImageUploadFirstObj?.thumbnail)}
                    style={{
                      width: "100%",
                      height: "160px",
                      // border: props.arrSelectedAps.indexOf(app) > -1 ? "2px solid #1ed660" : null,
                    }}
                    onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef2)}
                    name="1"
                  /> : null
                  }
                  {isImageUploadFirst && (
                    <Loader
                      type="Oval"
                      color="#57C074"
                      height={50}
                      width={50}
                    />
                  )}
                </div>
                <input type="text" hidden />
              </Box>
            </Grid>

            <Grid item md={3} sm={6} xs={6}>
              <Box
                style={{ position: "relative" }}
                id="img2"
                className={classes.placeholderImg}
              >
                <div className="d-none">
                  <SnUpload
                    name="files"
                    source={UPLOAD_SOURCE_DEPLOY}
                    ref={imgUploadEleRef3}
                    directoryMode={false}
                    onUpload={(e) => handleSecondImageUpload(e)}
                    uploadStarted={(e) => setIsImageUploadingSecond(e)}
                  />
                </div>
                  <div className={classes.previewImg} onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef3)} >
                    {!isImageUploadSecond && !Object.keys(isImageUploadSecondObj).length && <Box style={{ flexDirection: "column", justifyItems: 'center' }}> 
                      <Box style={{ position: "relative", textAlign: 'center' }}>
                        <ImgIcon />
                      </Box> 
                      <Box style={{ position: "relative", color: "grey", textAlign: 'center' }}>click to upload Image</Box> 
                      </Box>}
                    {!isImageUploadSecond && Object.keys(isImageUploadSecondObj).length ? <img
                      alt="app"
                      src={skylinkToUrl(isImageUploadSecondObj?.thumbnail)}
                      style={{
                        width: "100%",
                        height: "160px",
                        // border: props.arrSelectedAps.indexOf(app) > -1 ? "2px solid #1ed660" : null,
                      }}
                      onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef3)}
                      name="1"
                    /> : null
                    }
                    {isImageUploadSecond && (
                      <Loader
                        type="Oval"
                        color="#57C074"
                        height={50}
                        width={50}
                      />
                    )}
                  </div>
                  <input type="text" hidden />
              </Box>

            </Grid>
            <Grid item md={3} sm={6} xs={6}>
              <Box
                style={{ position: "relative" }}
                id="img3"
                className={classes.placeholderImg}
              >
                <div className="d-none">
                <SnUpload
                  name="files"
                  source={UPLOAD_SOURCE_DEPLOY}
                  ref={imgUploadEleRef4}
                  directoryMode={false}
                  onUpload={(e) => handleThirdImageUpload(e)}
                  uploadStarted={(e) => setIsImageUploadingThird(e)}
                />
              </div>
                <div className={classes.previewImg} onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef4)} >
                  {!isImageUploadThird && !Object.keys(isImageUploadThirdObj).length && <Box style={{ flexDirection: "column", justifyItems: 'center' }}> 
                      <Box style={{ position: "relative", textAlign: 'center' }}>
                        <ImgIcon />
                      </Box> 
                      <Box style={{ position: "relative", color: "grey", textAlign: 'center' }}>click to upload Image</Box> 
                      </Box>}
                  {!isImageUploadThird && Object.keys(isImageUploadThirdObj).length ? <img
                    alt="app"
                    src={skylinkToUrl(isImageUploadThirdObj?.thumbnail)}
                    style={{
                      width: "100%",
                      height: "160px",
                      // border: props.arrSelectedAps.indexOf(app) > -1 ? "2px solid #1ed660" : null,
                    }}
                    onClick={(evt) => handleDropZoneClick(evt, imgUploadEleRef4)}
                    name="1"
                  /> : null
                  }
                  {isImageUploadThird && (
                    <Loader
                      type="Oval"
                      color="#57C074"
                      height={50}
                      width={50}
                    />
                  )}
                </div>
                <input type="text" hidden />
              </Box>
            </Grid>
            {/* <Grid item md={3} sm={6} xs={6}>
              <Box className={classes.placeholderImg}></Box>
            </Grid> */}
          </Grid>
        </div>
        <div className={classes.OneRowInput}>
          <div>
            <label className={classes.textareaLabel}>
              App Description
              <span>Detailed summary of your app</span><Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip>
            </label>
          </div>
          <Box position="relative">
            <TextareaAutosize
              name="appDescription"
              ref={register}
              maxLength={5000}
              className={classes.textarea}
              aria-label="minimum height"
              rowsMin={6}
              // value="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et."
              placeholder="Detailed summary of your app"
            />
            <span className={classes.maxChar}>0/5000</span>
          </Box>
          {isAppDetailDesTrue && (
            <div className="required-field">Max 5000 Characters</div>
          )}
        </div>
        <div className={classes.OneRowInput}>
          <div>
            <label className={classes.textareaLabel}>
              Release Notes <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip>
              {/* <span>This will go on App Card.</span> */}
            </label>
          </div>
          <Box position="relative">
            <TextareaAutosize
              className={classes.textarea}
              aria-label="minimum height"
              rowsMin={4}
              ref={register}
              name="releaseNotes"
              maxLength={5000}
              // value="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et."
              placeholder="Write your Comment"
            />
            <span className={classes.maxChar}>0/5000</span>
          </Box>
          {isAppDetailDesTrue && (
            <div className="required-field">Max 5000 Characters</div>
          )}
        </div>
        <div className={classes.OneRowInput}>
          <div>
            <label className={classes.textareaLabel}>Social Connections <Tooltip className="iconLablel" title="site logo"><HelpOutline  /></Tooltip></label>
          </div>
          <Box position="relative">
            <Grid container spacing={2}>
              <Grid item md={6} lg={4} sm={12} xs={12}>
                <Box display="flex" className={classes.socialOptionContainer}>
                   <Select
                        isMulti={false}
                        ref={register}
                        onChange={(e) => setfirstSocialLinkTitle(e)}
                        options={socialOption}
                        styles={reactSelectStyles}
                        value={firstSocialLinkTitle}
                        classNamePrefix="socialMedia"
                        className={classes.socilaMediaSelect}
                        name="firstSocialLinkTitle"
                        defaultValue={firstSocialLinkTitle}
                    />
                  <input
                    value={firstSocialLink}
                    placeholder=""
                    onChange={(e) => setfirstSocialLink(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item md={6} lg={4} sm={12} xs={12}>
                <Box display="flex" className={classes.socialOptionContainer}>
                  <Select
                    isMulti={false}
                    as={Select}
                    ref={register}
                    classNamePrefix="socialMedia"
                    className={classes.socilaMediaSelect}
                    name="secondSocialLinkTitle"
                    value={secondSocialLinkTitle}
                    defaultValue={secondSocialLinkTitle}
                    onChange={(e) => setSecondSocialLinkTitle(e)}
                    options={socialOption}
                    styles={reactSelectStyles}
                  />
                  <input
                    placeholder=""
                    value={secondSocialLink}
                    onChange={(e) => setSecondSocialLink(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item md={6} lg={4} sm={12} xs={12}>
                <Box display="flex" className={classes.socialOptionContainer}>
                  <Select
                    isMulti={false}
                    ref={register}
                    control={control}
                    classNamePrefix="socialMedia"
                    className={classes.socilaMediaSelect}
                    name="thirdSocialLinkTitle"
                    value={thirdSocialLinkTitle}
                    defaultValue={thirdSocialLinkTitle}
                    onChange={(e) => setThirdSocialLinkTitle(e)}
                    options={socialOption}
                    styles={reactSelectStyles}
                  />
                  <input
                    placeholder=""
                    value={thirdSocialLink}
                    onChange={(e) => setThirdSocialLink(e.target.value)}
                  />
                </Box>
              </Grid>

              <Grid item md={6} lg={4} style={{ alignSelf: "center" }}>
                <Button
                  className={classes.button}
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmit}
                >
                  {isSubmit ? (
                    <Loader
                      type="Oval"
                      color="#FFFFFF"
                      height={15}
                      width={15}
                    />
                  ) : (
                    "Save"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </div>
      </Box>
    </Box>
  );
};

export default EditPublishApp;
