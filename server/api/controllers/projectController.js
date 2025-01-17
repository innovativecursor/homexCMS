const Project = require("../models/Projects");
const cloudinary = require("../../utils/cloudinary");
const { formattedResult } = require("../utils/Consts");
const { Op, Sequelize } = require("sequelize");
const Joi = require("joi");
// Define Joi schema
const projectSchema = Joi.object({
  project_name: Joi.string().required(),
  location: Joi.string().required(),
  keyFeatures: Joi.string().required(),
  executionTime: Joi.string().required(),
  turnOver: Joi.number().required(),
  project_desc: Joi.string().required(),
  pictures: Joi.array().required(), // Assuming pictures are base64 encoded strings
});
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({});
    const result = formattedThumbnails(projects);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};
exports.createProject = async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0]?.message });
  }
  let project;
  try {
    project = await Project.create({
      project_name: req.body?.project_name,
      location: req.body?.location,
      keyFeatures: req.body?.keyFeatures,
      executionTime: req.body?.executionTime,
      turnOver: req.body?.turnOver,
      project_desc: req.body?.project_desc,
      pictures: [],
    });
    // Generate a unique folder name using the property ID
    const folderName = `${process.env.CLOUDINARY_DB}/Project_${project?.project_id}`;

    // Upload pictures to Cloudinary
    const uploadPromises = req.body?.pictures?.map((base64Data) => {
      return cloudinary.uploader.upload(base64Data, {
        folder: folderName, // Specify the folder for uploaded images
      });
    });

    const uploadedImages = await Promise.all(uploadPromises || []);

    // Update the property with the uploaded images
    await project.update({ pictures: uploadedImages });
    res.status(201).json({
      message: "Project Created Successfully!",
    });
  } catch (error) {
    await project.destroy();
    res.status(500).json({ message: error?.message, error: error.message });
  }
};

exports.updateProject = (req, res) => {};

exports.deleteProject = (req, res) => {};
