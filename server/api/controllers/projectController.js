const Project = require("../models/Projects");
const cloudinary = require("../../utils/cloudinary");
const { formattedResult, formattedThumbnails } = require("../utils/Consts");
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
    const result = formattedResult(projects);
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
    // Generate a unique folder name using the project ID
    const folderName = `${process.env.CLOUDINARY_DB}/Project_${project?.project_id}`;

    // Upload pictures to Cloudinary
    const uploadPromises = req.body?.pictures?.map((base64Data) => {
      return cloudinary.uploader.upload(base64Data, {
        folder: folderName, // Specify the folder for uploaded images
      });
    });

    const uploadedImages = await Promise.all(uploadPromises || []);

    // Update the project with the uploaded images
    await project.update({ pictures: uploadedImages });
    res.status(201).json({
      message: "Project Created Successfully!",
    });
  } catch (error) {
    await project.destroy();
    res.status(500).json({ message: error?.message, error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = req.body;

    const proj = await Project.findByPk(id);
    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    const folderName = `${process.env.CLOUDINARY_DB}/Project_${id}`;

    const cloudinaryFiles = await cloudinary.api.resources({
      type: "upload",
      prefix: folderName,
    });

    const cloudinaryPublicIds = cloudinaryFiles.resources.map(
      (file) => file.public_id
    );

    const updatedPublicIds = updatedData?.pictures
      .map((pic) => pic.public_id)
      .filter(Boolean);
    const deletePromises = cloudinaryPublicIds
      .filter((publicId) => !updatedPublicIds?.includes(publicId))
      .map((publicId) => cloudinary.uploader.destroy(publicId));

    await Promise.all(deletePromises);

    const uploadPromises = updatedData.pictures
      .filter((pic) => typeof pic === "string")
      .map((base64Data) =>
        cloudinary.uploader.upload(base64Data, { folder: folderName })
      );

    const uploadedImages = await Promise.all(uploadPromises);

    const allImages = [
      ...updatedData?.pictures?.filter((pic) => typeof pic !== "string"),
      ...uploadedImages,
    ];

    updatedData.pictures = allImages;

    await proj.update(updatedData);

    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const proj = await Project.findByPk(id);
    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Extract the pictures array from the testimonial
    const { pictures } = proj;
    // If there are pictures, proceed with deleting them from Cloudinary
    if (pictures && pictures.length > 0) {
      const folderName = pictures[0]?.folder;

      // Delete all pictures associated with the staff member
      const deletePromises = pictures.map((picture) =>
        cloudinary.uploader.destroy(picture.public_id)
      );
      await Promise.all(deletePromises);

      // Check if there are any remaining files in the folder and delete them
      const filesInFolder = await cloudinary.api.resources({
        type: "upload",
        prefix: folderName,
      });

      const deleteFilePromises = filesInFolder.resources.map((file) =>
        cloudinary.uploader.destroy(file.public_id)
      );

      await Promise.all(deleteFilePromises);

      // Finally, delete the folder itself
      await cloudinary.api.delete_folder(folderName);
    }

    // Delete the testimonial from the database
    await proj.destroy();

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete testimonial", error: error.message });
  }
};
