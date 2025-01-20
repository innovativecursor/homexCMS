const cloudinary = require("../../utils/cloudinary");
const Staff = require("../models/staff");
const { formattedResult } = require("../utils/Consts");

// Joi validation schema

// Get all staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({});
    const result = formattedResult(staff);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};
// Post a new event
// exports.postStaff = async (req, res) => {
//   // Validate the incoming request data
//   const { error } = validateStaff(req.body);
//   if (error) {
//     return res.status(400).json({
//       message: "Please Fill in all the Fields",
//       error: error.details[0].message,
//     });
//   }

//   try {
//     const { staff_name, staff_position, staff_featured, pictures } = req.body;

//     // Create the event in the database
//     const staff = await Staff.create({
//       staff_name,
//       staff_position,
//       staff_featured,
//       pictures: [],
//     });

//     const folderName = `${process.env.CLOUDINARY_DB}/staff_${staff.staff_id}`;

//     // Upload pictures to Cloudinary
//     const uploadPromises = pictures?.map((base64Data) => {
//       return cloudinary.uploader.upload(base64Data, {
//         folder: folderName,
//       });
//     });

//     const uploadedImages = await Promise.all(uploadPromises);

//     // Update the staff with the uploaded images
//     await staff.update({ pictures: uploadedImages });

//     res.status(201).json({ message: "Staff created successfully", staff });
//   } catch (error) {
//     res.status(500).json({ message: error.message, error: error.message });
//   }
// };
exports.postStaff = async (req, res) => {
  let staff;
  try {
    staff = await Staff.create({
      staff_name: req.body?.staff_name,
      staff_position: req.body?.staff_position,
      pictures: [],
    });
    // Generate a unique folder name using the staff ID
    const folderName = `${process.env.CLOUDINARY_DB}/Staff_${staff?.staff_id}`;

    // Upload pictures to Cloudinary
    const uploadPromises = req.body?.pictures?.map((base64Data) => {
      return cloudinary.uploader.upload(base64Data, {
        folder: folderName, // Specify the folder for uploaded images
      });
    });

    const uploadedImages = await Promise.all(uploadPromises || []);

    // Update the staff with the uploaded images
    await staff.update({ pictures: uploadedImages });
    res.status(201).json({
      message: "Staff Created Successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error?.message, error: error.message });
  }
};
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = req.body;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const folderName = `${process.env.CLOUDINARY_DB}/Staff_${id}`;

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

    await staff.update(updatedData);

    res.status(200).json({ message: "Staff updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Extract the pictures array from the testimonial
    const { pictures } = staff;
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
    await staff.destroy();

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};
