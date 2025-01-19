// routes/index.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const inquiryController = require("../controllers/inquiryController");
const projectController = require("../controllers/projectController");
const authenticateUser = require("../middleware/authenticateUser");
const serviceController = require("../controllers/serviceController");
const { apiLimiter } = require("../middleware/apiLimiter");
const aboutController = require("../controllers/aboutController");

// User routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword", userController.resetPassword);
router.get("/users", authenticateUser, userController.allUsers);

// Inquiry Routes
router.get(
  "/fetchInquiries",
  authenticateUser,
  inquiryController.fetchInquiries
);
router.post("/sendInquiry", apiLimiter, inquiryController.createInquiry);
router.delete(
  "/deleteInquiry/:id",
  authenticateUser,
  inquiryController.deleteInquiry
);
//Projects
router.get("/fetchProjects", projectController.getProjects);
router.post(
  "/createProject",
  authenticateUser,
  projectController.createProject
);
router.put(
  "/updateProject/:id",
  authenticateUser,
  projectController.updateProject
);
router.delete(
  "/deleteProject/:id",
  authenticateUser,
  projectController.deleteProject
);
//About
router.get("/aboutpage", aboutController.getAbout);
router.put("/updateAbout/:id", authenticateUser, aboutController.updateAbout);

//Services Controller
router.get("/fetchServices", serviceController.getServices);
router.post(
  "/createServices",
  authenticateUser,
  serviceController.createService
);
router.put(
  "/updateServices/:id",
  authenticateUser,
  serviceController.updateService
);
router.delete(
  "/deleteServices/:id",
  authenticateUser,
  serviceController.deleteService
);
module.exports = router;
