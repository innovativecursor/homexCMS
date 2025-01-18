const About = require("../models/about");
const Joi = require("joi");
const { formatteddualImages } = require("../utils/Consts");
const aboutSchema = Joi.object({
  about_title: Joi.string().required(),
  description: Joi.string().required(),
  subdescription: Joi.string().required(),
  our_values1: Joi.string().required(),
  our_values2: Joi.number().required(),
  our_values3: Joi.string().required(),
  our_values3: Joi.string().required(),
  about_image1: Joi.array().required(),
  about_image2: Joi.array().required(),
});
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne({});
    const result = formatteddualImages(about);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.updateAbout = async (req, res) => {
  const { error } = aboutSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0]?.message });
  }

  try {
    const updatedData = req.body;
    let about = await About.findOne({});
    if (!about) {
      return res.status(404).json({ message: "About Content not found" });
    }

    const folderName = `${process.env.CLOUDINARY_DB}/About`;

    // Helper function to handle image uploads and deletions
    const processImages = async (imageField) => {
      const cloudinaryFiles = await cloudinary.api.resources({
        type: "upload",
        prefix: folderName,
      });

      const cloudinaryPublicIds = cloudinaryFiles.resources.map(
        (file) => file.public_id
      );

      const updatedPublicIds = updatedData[imageField]
        .map((pic) => pic.public_id)
        .filter(Boolean);

      const deletePromises = cloudinaryPublicIds
        .filter((publicId) => !updatedPublicIds.includes(publicId))
        .map((publicId) => cloudinary.uploader.destroy(publicId));

      await Promise.all(deletePromises);

      const uploadPromises = updatedData[imageField]
        .filter((pic) => typeof pic === "string")
        .map((base64Data) =>
          cloudinary.uploader.upload(base64Data, { folder: folderName })
        );

      const uploadedImages = await Promise.all(uploadPromises);

      return [
        ...updatedData[imageField].filter((pic) => typeof pic !== "string"),
        ...uploadedImages,
      ];
    };

    // Process about_image1 and about_image2
    updatedData.about_image1 = await processImages("about_image1");
    updatedData.about_image2 = await processImages("about_image2");

    await about.update(updatedData);

    res.status(200).json({ message: "About content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
