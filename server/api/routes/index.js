// routes/index.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const inquiryController = require("../controllers/inquiryController");
const projectController = require("../controllers/projectController");
const authenticateUser = require("../middleware/authenticateUser");
const fontColorController = require("../controllers/fontColorController");
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

//Font and its Color
router.get("/getFontColor", fontColorController.getFontColor);
router.put(
  "/updateFontColor/:id",
  authenticateUser,
  fontColorController.updateFontColor
);
module.exports = router;
