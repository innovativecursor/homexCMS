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
const achievementController = require("../controllers/achievementController");
const testimonialController = require("../controllers/testimonialController");
const staffController = require("../controllers/staffController");

// User routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword", userController.resetPassword);
router.get("/users", authenticateUser, userController.allUsers);
router.delete("/deleteUser/:id", authenticateUser, userController.deleteUser);

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
router.get("/getproject", projectController.getProjects);
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
router.get("/getservice", serviceController.getServices);
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

//Achievements
router.get("/getachivements", achievementController.getAchievements);
router.put(
  "/updateAchievements/:id",
  authenticateUser,
  achievementController.updateAchievement
);
// Testimonials
router.get("/gettestimonials", testimonialController.getTestimonials);
router.post(
  "/createTestimonial",
  authenticateUser,
  testimonialController.createTestimonial
);
router.put(
  "/updateTestimonial/:id",
  authenticateUser,
  testimonialController.updateTestimonial
);
router.delete(
  "/deleteTestimonial/:id",
  authenticateUser,
  testimonialController.deleteTestimonial
);

// Staff routes
router.get("/getteam", staffController.getStaff);
router.post("/createStaff", authenticateUser, staffController.postStaff);
router.put("/updateStaff/:id", authenticateUser, staffController.updateStaff);
router.delete(
  "/deleteStaff/:id",
  authenticateUser,
  staffController.deleteStaff
);
module.exports = router;
