import React, { useEffect, useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import PageWrapper from "../PageContainer/PageWrapper";
import {
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Slider,
  Space,
  Spin,
  Switch,
  TreeSelect,
  Upload,
} from "antd";
import Creatable from "react-select/creatable";
import Select from "react-select";
import {
  deleteAxiosCall,
  getAxiosCall,
  postAxiosCall,
  updateAxiosCall,
} from "../../Axios/UniversalAxiosCalls";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const { TextArea } = Input;
function GlobalForm(props) {
  const [loading, setLoading] = useState(false);
  const [imageArray, setImageArray] = useState([]);
  const [imageArray2, setImageArray2] = useState([]);
  const [inputs, setInputs] = useState({});
  const [location, setLocation] = useState({});
  const [stationOptions, setStationOptions] = useState();
  const [imageClone, setImageClone] = useState(props?.record?.pictures || []);
  const [imageClone2, setImageClone2] = useState([]);
  const [menuOptions, setMenuOptions] = useState([]);
  const [projects, setProjects] = useState();
  const [check, setcheck] = useState(false);

  const NavigateTo = useNavigate();
  useEffect(() => {
    setInputs(props?.record);
  }, [props?.record]);
  useEffect(() => {
    callAboutus();
  }, []);

  const callAboutus = async () => {
    if (props?.type === "About") {
      const fetchAboutDetails = await getAxiosCall("/aboutpage");
      setInputs(fetchAboutDetails?.data);
      setImageClone(fetchAboutDetails?.data?.about_image1);
      setImageClone2(fetchAboutDetails?.data?.about_image2);
    }
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const convertAllToBase64 = async () => {
    if (props.pageMode === "Add") {
      if (imageArray?.length != 0) {
        let B64Array = [];
        let asd;
        for (let i = 0; i < imageArray?.length; i++) {
          const base64String = await getBase64(imageArray[i]?.originFileObj);
          B64Array.push(base64String);
        }
        let dummyObj = { pictures: [...B64Array] };

        asd = Object.assign(inputs, { pictures: dummyObj?.pictures });
        setInputs({ ...inputs, pictures: asd });
      }
    } else {
      if (imageArray?.length != 0 && props?.type != "About") {
        let B64Array = [];
        let asd;
        for (let i = 0; i < imageArray.length; i++) {
          const base64String = await getBase64(imageArray[i]?.originFileObj);
          B64Array.push(base64String);
        }
        let dummyObj = { pictures: [...B64Array] };
        asd = Object.assign(inputs, { pictures: dummyObj?.pictures });
        setInputs({ ...inputs, pictures: asd });
      }

      if (props?.type === "About") {
        let B64Array = [];
        let asd;
        if (imageArray?.length !== 0 || imageClone === undefined) {
          for (let i = 0; i < imageArray.length; i++) {
            const base64String = await getBase64(imageArray[i]?.originFileObj);
            B64Array.push(base64String);
          }
          let dummyObj = { about_image1: [...B64Array] };
          asd = Object.assign(inputs, { about_image1: dummyObj?.about_image1 });
          setInputs({ ...inputs, about_image1: asd });
          B64Array = [];
        }
        if (imageArray2?.length !== 0 || imageClone2 === undefined) {
          for (let i = 0; i < imageArray2.length; i++) {
            const base64String = await getBase64(imageArray2[i]?.originFileObj);
            B64Array.push(base64String);
          }
          let dummyObj2 = { about_image2: [...B64Array] };
          asd = Object.assign(inputs, {
            about_image2: dummyObj2?.about_image2,
          });
          setInputs({ ...inputs, about_image2: asd });
          B64Array = [];
        }
      }
    }
  };
  // A submit form used for both (i.e.. Products & Awards)
  const submitForm = async () => {
    try {
      switch (props.pageMode) {
        case "Add":
          if (imageArray?.length == 0 && props?.type !== "Testimonials") {
            Swal.fire({
              title: "error",
              text: "Add at least one Picture to proceed!",
              icon: "error",
              confirmButtonText: "Alright!",
              allowOutsideClick: false,
            });
            return;
          } else {
            // Converting images to base64
            await convertAllToBase64();
          }
          if (props.type === "Projects") {
            let answer;

            answer = await postAxiosCall("/createProject", inputs);
            if (answer) {
              Swal.fire({
                title: "Success",
                text: answer?.message,
                icon: "success",
                confirmButtonText: "Great!",
                allowOutsideClick: false,
              }).then(() => {
                window.location.reload(true);
              });
              setInputs({});
            }
          }
          if (props.type === "Services") {
            let answer;
            answer = await postAxiosCall("/createServices", inputs);
            if (answer) {
              Swal.fire({
                title: "Success",
                text: answer?.message,
                icon: "success",
                confirmButtonText: "Great!",
                allowOutsideClick: false,
              }).then(() => {
                window.location.reload(true);
              });
              setInputs({});
            }
          }
          break;
        case "Update":
          if (imageArray?.length == 0 && imageClone?.length == 0) {
            Swal.fire({
              title: "error",
              text: "Add at least one Picture to proceed!",
              icon: "error",
              confirmButtonText: "Alright!",
              allowOutsideClick: false,
            });
            return;
          }
          if (
            props?.type === "About" &&
            imageArray2?.length == 0 &&
            imageClone2?.length == 0
          ) {
            Swal.fire({
              title: "error",
              text: "Add at least one Picture in About Image 2 to proceed!",
              icon: "error",
              confirmButtonText: "Alright!",
              allowOutsideClick: false,
            });
            return;
          } else {
            //merging the new images (if uploaded)
            await convertAllToBase64();
          }
          if (props.type === "About") {
            const updatedResult = await updateAxiosCall(
              "/updateAbout",
              1,
              inputs
            );
            if (updatedResult) {
              Swal.fire({
                title: "Success",
                text: updatedResult?.message,
                icon: "success",
                confirmButtonText: "Great!",
                allowOutsideClick: false,
              }).then(() => {
                setInputs({});
                window.location.reload(true);
              });
            }
          }
          if (props.type === "Projects") {
            const updatedResult = await updateAxiosCall(
              "/updateProject",
              props?.record?.project_id,
              inputs
            );
            if (updatedResult) {
              Swal.fire({
                title: "Success",
                text: updatedResult?.message,
                icon: "success",
                confirmButtonText: "Great!",
                allowOutsideClick: false,
              }).then(() => {
                setInputs();
                NavigateTo("/updateProjects");
              });
            }
          }
          if (props.type === "Services") {
            const updatedResult = await updateAxiosCall(
              "/updateServices",
              props?.record?.service_id,
              inputs
            );
            if (updatedResult) {
              Swal.fire({
                title: "Success",
                text: updatedResult?.message,
                icon: "success",
                confirmButtonText: "Great!",
                allowOutsideClick: false,
              }).then(() => {
                setInputs();
                NavigateTo("/updateServices");
              });
            }
          }
          break;
        case "Delete":
          Swal.fire({
            title: "info",
            text: "Are You Sure You want to Delete This Product",
            icon: "info",
            confirmButtonText: "Delete",
            showCancelButton: true,
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              remove();
            }
          });
          break;
        default:
          break;
      }
    } catch (error) {
      Swal.fire({
        title: "error",
        text: error,
        icon: "error",
        confirmButtonText: "Alright!",
        allowOutsideClick: false,
      });
    }
  };
  const remove = async () => {
    let answer;
    if (props?.type === "Projects" && props?.type) {
      answer = await deleteAxiosCall(
        "/deleteProject",
        props?.record?.project_id
      );
      if (answer) {
        Swal.fire({
          title: "Success",
          text: answer?.message,
          icon: "success",
          confirmButtonText: "Great!",
          allowOutsideClick: false,
        });
        setInputs();
        NavigateTo("/deleteProjects");
      }
    }
    if (props?.type === "Services" && props?.type) {
      answer = await deleteAxiosCall(
        "/deleteServices",
        props?.record?.service_id
      );
      if (answer) {
        Swal.fire({
          title: "Success",
          text: answer?.message,
          icon: "success",
          confirmButtonText: "Great!",
          allowOutsideClick: false,
        });
        setInputs();
        NavigateTo("/deleteServices");
      }
    }
  };
  const deleteImage = async (imageIndex) => {
    let answer = await deleteAxiosCall(
      "/deleteHero",
      imageClone[imageIndex]?.public_id
    );

    if (answer) {
      Swal.fire({
        title: "Success",
        text: answer?.message,
        icon: "success",
        confirmButtonText: "Great!",
        allowOutsideClick: false,
      }).then(() => {
        window.location.reload(true);
      });
      setInputs({});
    }
  };
  const deleteFnc = async (imageIndex) => {
    const dupli = inputs?.pictures;
    dupli?.splice(imageIndex, 1);
    setInputs({ ...inputs, pictures: dupli });
  };
  const deleteModal = (index) => {
    Swal.fire({
      title: "info",
      text: "Are You Sure You want to Delete This Picture",
      icon: "info",
      confirmButtonText: "Delete",
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (props?.type == "Hero") {
          deleteImage(index);
        } else {
          deleteFnc(index);
        }
      }
    });
  };
  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10; // Size in MB
    if (!isLt10M) {
      Swal.fire({
        title: "Error",
        text: "Image must be smaller than 10MB!",
        icon: "error",
        confirmButtonText: "Alright!",
        allowOutsideClick: false,
      });
    }
    return isLt10M || Upload.LIST_IGNORE; // Prevent upload if file size exceeds limit
  };
  return (
    <>
      {props?.type === "Projects" ? (
        <PageWrapper title={`${props?.pageMode} Projects`}>
          <div className="container mx-auto p-4 text-xl">
            <Form onFinish={submitForm}>
              <div className="grid grid-cols-1 my-2 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Name of the Project <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, project_name: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.project_name}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    location
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, location: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.location}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Key Features
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, keyFeatures: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.keyFeatures}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Execution Time
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, executionTime: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.executionTime}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Turn Over
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, turnOver: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.turnOver}
                  />
                </div>
              </div>
              <div className="my-5">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <TextArea
                  disabled={props?.pageMode === "Delete" ? true : false}
                  type="text"
                  id="project_desc"
                  name="project_desc"
                  className="mt-1 p-2 block w-full border rounded-md"
                  onChange={(e) => {
                    setInputs({ ...inputs, [e.target.name]: e.target.value });
                  }}
                  value={inputs?.project_desc}
                />
              </div>
              {/* Upload Pictures */}
              {props.pageMode === "Add" || props.pageMode === "Update" ? (
                <div className="my-5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload Pictures (Max size upto 10 MB){" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <Upload
                    action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                    // action="/upload.do"
                    listType="picture-card"
                    multiple={false}
                    beforeUpload={beforeUpload}
                    name="productImages"
                    fileList={imageArray}
                    maxCount={1}
                    onChange={(e) => {
                      setImageArray(e.fileList);
                    }}
                  >
                    <div>
                      <PlusOutlined />
                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Upload
                      </div>
                    </div>
                  </Upload>
                </div>
              ) : (
                ""
              )}
              {/* Pictures */}
              {props?.pageMode !== "Add" ? (
                <div className="my-5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pictures
                  </label>
                  <div className="w-full flex flex-row">
                    {imageClone?.map((el, index) => (
                      <div className="card" key={index}>
                        <div className="flex h-60 justify-center">
                          <img
                            src={el?.url}
                            alt="asd4e"
                            className="object-contain"
                          />
                        </div>
                        {props.pageMode !== "View" &&
                        props.pageMode !== "Delete" ? (
                          <div className="flex flex-row justify-center items-end">
                            <button
                              className="my-4 text-black p-4 font-semibold bg-orange-400 hover:text-white rounded-lg"
                              onClick={() => deleteModal(index)}
                              type="button"
                            >
                              Delete Picture
                            </button>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                ""
              )}
              {props.pageMode === "View" ? (
                ""
              ) : (
                <div className="acitonButtons w-full flex justify-center">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out items-center justify-center"
                    type="submit"
                  >
                    {props.pageMode} Data
                  </button>
                </div>
              )}
            </Form>
          </div>
        </PageWrapper>
      ) : props?.type === "About" ? (
        <PageWrapper title={`${props?.pageMode} About Us`}>
          <div className="container mx-auto p-4 text-xl">
            <Form onFinish={submitForm}>
              <div className="grid grid-cols-1 my-2 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, about_title: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.about_title}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Our Values 1 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, our_values1: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.our_values1}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Our Values 2 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, our_values2: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.our_values2}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Our Values 3 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, our_values3: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.our_values3}
                  />
                </div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Our Values 4 <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, our_values4: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.our_values4}
                  />
                </div>
              </div>
              <div className="my-5">
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <TextArea
                  disabled={props?.pageMode === "Delete" ? true : false}
                  type="text"
                  id="description"
                  name="description"
                  className="mt-1 p-2 block w-full border rounded-md"
                  onChange={(e) => {
                    setInputs({ ...inputs, [e.target.name]: e.target.value });
                  }}
                  value={inputs?.description}
                  required
                />
              </div>
              <div className="my-5">
                <label className="block text-sm font-medium text-gray-700">
                  Our Mission <span className="text-red-500">*</span>
                </label>
                <TextArea
                  disabled={props?.pageMode === "Delete" ? true : false}
                  type="text"
                  id="subdescription"
                  name="subdescription"
                  className="mt-1 p-2 block w-full border rounded-md"
                  onChange={(e) => {
                    setInputs({ ...inputs, [e.target.name]: e.target.value });
                  }}
                  value={inputs?.subdescription}
                  required
                />
              </div>
              {/* Upload Pictures */}
              <div className="my-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  About Image 1 (Max size upto 10 MB){" "}
                  <span className="text-red-600">*</span>
                </label>
                <Upload
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  // action="/upload.do"
                  listType="picture-card"
                  multiple={false}
                  name="imageArray"
                  fileList={imageArray}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  onChange={(e) => {
                    setImageArray(e.fileList);
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      Upload
                    </div>
                  </div>
                </Upload>
              </div>
              {/* Pictures */}
              <div className="my-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pictures
                </label>
                <div className="w-full flex flex-row">
                  {imageClone?.map((el, index) => (
                    <div className="card" key={index}>
                      <div className="flex h-60 max-w-md  justify-center">
                        <img
                          src={el?.url}
                          alt="asd4e"
                          className="object-contain"
                        />
                      </div>
                      {/* {props.pageMode !== "View" &&
                      props.pageMode !== "Delete" ? (
                        <div className="flex flex-row justify-center items-end">
                          <button
                            className="my-4 text-black p-4 font-semibold bg-orange-400 hover:text-white rounded-lg"
                            onClick={() => deleteModal(index)}
                            type="button"
                          >
                            Delete Picture
                          </button>
                        </div>
                      ) : (
                        ""
                      )} */}
                    </div>
                  ))}
                </div>
              </div>
              {/* Upload Pictures 2 */}
              <div className="my-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  About Image 2 (Max size upto 10 MB){" "}
                  <span className="text-red-600">*</span>
                </label>
                <Upload
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  // action="/upload.do"
                  listType="picture-card"
                  multiple={false}
                  name="imageArray2"
                  fileList={imageArray2}
                  maxCount={1}
                  beforeUpload={beforeUpload}
                  onChange={(e) => {
                    setImageArray2(e.fileList);
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      Upload
                    </div>
                  </div>
                </Upload>
              </div>
              {/* Pictures */}
              <div className="my-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pictures
                </label>
                <div className="w-full flex flex-row">
                  {imageClone2?.map((el, index) => (
                    <div className="card" key={index}>
                      <div className="flex h-60 max-w-md justify-center">
                        <img
                          src={el?.url}
                          alt="asd4e"
                          className="object-contain"
                        />
                      </div>
                      {/* {props.pageMode !== "View" &&
                      props.pageMode !== "Delete" ? (
                        <div className="flex flex-row justify-center items-end">
                          <button
                            className="my-4 text-black p-4 font-semibold bg-orange-400 hover:text-white rounded-lg"
                            onClick={() => deleteModal(index)}
                            type="button"
                          >
                            Delete Picture
                          </button>
                        </div>
                      ) : (
                        ""
                      )} */}
                    </div>
                  ))}
                </div>
              </div>
              <div className="acitonButtons w-full flex justify-center">
                <button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out items-center justify-center"
                  type="submit"
                >
                  {props.pageMode} Data
                </button>
              </div>
            </Form>
          </div>
        </PageWrapper>
      ) : props?.type === "Services" ? (
        <PageWrapper title={`${props?.pageMode} Services`}>
          <div className="container mx-auto p-4 text-xl">
            <Form onFinish={submitForm}>
              <div className="grid grid-cols-1 my-2 sm:grid-cols-2 md:grid-cols-2 gap-6">
                <div className="">
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-600">*</span>
                  </label>
                  <Input
                    disabled={
                      props?.pageMode === "Delete" || props?.pageMode === "View"
                        ? true
                        : false
                    }
                    required
                    isMulti={false}
                    onChange={(e) => {
                      setInputs({ ...inputs, service_name: e.target.value });
                    }}
                    isClearable
                    options={projects?.length != 0 ? projects : []}
                    isSearchable
                    value={inputs?.service_name}
                  />
                </div>
              </div>
              {/* Upload Pictures */}
              <div className="my-5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Picture (Max size upto 10 MB){" "}
                  <span className="text-red-600">*</span>
                </label>
                <Upload
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  // action="/upload.do"
                  listType="picture-card"
                  multiple={false}
                  name="imageArray"
                  fileList={imageArray}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  onChange={(e) => {
                    setImageArray(e.fileList);
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      Upload
                    </div>
                  </div>
                </Upload>
              </div>
              {/* Pictures */}
              {props?.pageMode !== "Add" ? (
                <div className="my-5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pictures
                  </label>
                  <div className="w-full flex flex-row">
                    {imageClone?.map((el, index) => (
                      <div className="card" key={index}>
                        <div className="flex h-60 max-w-md  justify-center">
                          <img
                            src={el?.url}
                            alt="asd4e"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div className="acitonButtons w-full flex justify-center">
                <button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out items-center justify-center"
                  type="submit"
                >
                  {props.pageMode} Data
                </button>
              </div>
            </Form>
          </div>
        </PageWrapper>
      ) : (
        <></>
      )}
    </>
  );
}

export default GlobalForm;
