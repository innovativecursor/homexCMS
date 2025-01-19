const Service = require("../models/Services");
const cloudinary = require("../../utils/cloudinary");
const { formattedResult, formattedThumbnails } = require("../utils/Consts");
const Joi = require("joi");
// Define Joi schema
const ServiceSchema = Joi.object({
  service_name: Joi.string().required(),
  pictures: Joi.array().required(), // Assuming pictures are base64 encoded strings
});
exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll({});
    const result = formattedResult(services);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};
exports.createService = async (req, res) => {
  const { error } = ServiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0]?.message });
  }
  let service;
  try {
    service = await Service.create({
      service_name: req.body?.service_name,
      pictures: [],
    });
    // Generate a unique folder name using the service ID
    const folderName = `${process.env.CLOUDINARY_DB}/Service_${service?.service_id}`;

    // Upload pictures to Cloudinary
    const uploadPromises = req.body?.pictures?.map((base64Data) => {
      return cloudinary.uploader.upload(base64Data, {
        folder: folderName, // Specify the folder for uploaded images
      });
    });

    const uploadedImages = await Promise.all(uploadPromises || []);

    // Update the service with the uploaded images
    await service.update({ pictures: uploadedImages });
    res.status(201).json({
      message: "Service Created Successfully!",
    });
  } catch (error) {
    await service.destroy();
    res.status(500).json({ message: error?.message, error: error.message });
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const folderName = `${process.env.CLOUDINARY_DB}/Service_${id}`;

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

    await service.update(updatedData);

    res.status(200).json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Extract the pictures array from the testimonial
    const { pictures } = service;
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
    await service.destroy();

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};
