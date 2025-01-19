const About = require("../models/about");
const Joi = require("joi");
const cloudinary = require("../../utils/cloudinary");

const { formatteddualImages } = require("../utils/Consts");
const aboutSchema = Joi.object({
  about_title: Joi.string().required(),
  description: Joi.string().required(),
  subdescription: Joi.string().required(),
  our_values1: Joi.string().required(),
  our_values2: Joi.string().required(),
  our_values3: Joi.string().required(),
  our_values4: Joi.string().required(),
  about_image1: Joi.array().required(),
  about_image2: Joi.array().required(),
});
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne({});
    // const result = formatteddualImages(about);
    // res.status(200).json(result);
    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.updateAbout = async (req, res) => {
  let about;
  try {
    const updatedData = req.body;
    about = await About.findOne({});

    if (!about) {
      about = await About.create({
        about_title: updatedData.about_title,
        description: updatedData.description,
        subdescription: updatedData.subdescription,
        our_values1: updatedData.our_values1,
        our_values2: updatedData.our_values2,
        our_values3: updatedData.our_values3,
        our_values4: updatedData.our_values4,
        about_image1: [],
        about_image2: [],
      });
    }

    const folderName = `${process.env.CLOUDINARY_DB}/About`;

    const processImageField = async (imageField) => {
      const existingImages = about[imageField] || [];
      const updatedImages = updatedData[imageField] || [];

      // Filter out existing images that are not in updated data (marked for deletion)
      const imagesToDelete = existingImages
        .filter(
          (img) =>
            !updatedImages.some((newImg) => newImg.public_id === img.public_id)
        )
        .map((img) => cloudinary.uploader.destroy(img.public_id));

      await Promise.all(imagesToDelete);

      // Upload new images that are base64 strings
      const uploadPromises = updatedImages
        .filter((img) => typeof img === "string")
        .map((base64Data) =>
          cloudinary.uploader.upload(base64Data, { folder: folderName })
        );

      const uploadedImages = await Promise.all(uploadPromises);

      // Combine existing images that are retained and newly uploaded images
      const finalImages = updatedImages
        .filter((img) => typeof img !== "string") // Retain non-string (existing) images
        .concat(uploadedImages); // Add newly uploaded images

      return finalImages;
    };

    // Process about_image1 and about_image2 fields
    updatedData.about_image1 = await processImageField("about_image1");
    updatedData.about_image2 = await processImageField("about_image2");
    await about.update(updatedData);

    res.status(200).json({ message: "About content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
