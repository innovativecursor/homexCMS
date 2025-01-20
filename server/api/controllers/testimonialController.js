const Testimonial = require("../models/testimonials");
const cloudinary = require("../../utils/cloudinary");
const { formattedThumbnails } = require("../utils/Consts");

exports.getTestimonials = async (req, res) => {
  try {
    const testimonialsFetched = await Testimonial.findAll({});
    // res.status(200).json(testimonialsFetched);

    const result = formattedThumbnails(testimonialsFetched);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch Testimonials", error: error.message });
  }
};
exports.createTestimonial = async (req, res) => {
  let testimonial;
  try {
    testimonial = await Testimonial.create({
      reviewer_name: req.body?.reviewer_name,
      reviewer_location: req.body?.reviewer_location,
      client_rating: req.body?.client_rating,
      review: req.body?.review,
      pictures: [],
    });
    if (req.body?.pictures?.length !== 0) {
      // Generate a unique folder name using the testimonial ID
      const folderName = `${process.env.CLOUDINARY_DB}/Testimonial_${testimonial?.testimonial_id}`;

      // Upload pictures to Cloudinary
      const uploadPromises = req.body?.pictures?.map((base64Data) => {
        return cloudinary.uploader.upload(base64Data, {
          folder: folderName, // Specify the folder for uploaded images
        });
      });

      const uploadedImages = await Promise.all(uploadPromises || []);

      // Update the testimonial with the uploaded images
      await testimonial.update({ pictures: uploadedImages });
    }
    res.status(201).json({
      message: "Testimonial Created Successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error?.message, error: error.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = req.body;

    const proj = await Testimonial.findByPk(id);
    if (!proj) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    const folderName = `${process.env.CLOUDINARY_DB}/Testimonial_${id}`;

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

    res.status(200).json({ message: "Testimonial updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Testimonial.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Extract the pictures array from the testimonial
    const { pictures } = test;
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
    await test.destroy();

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Example Express route handling video upload
// exports.createTestimonial = async (req, res) => {
//   const { reviewer_name, reviewer_location, client_rating, review, pictures } =
//     req.body;
//   if (review == undefined && pictures?.length == 0) {
//     return res
//       .status(401)
//       .json({ message: "Review or Image/Videos are mandatory" });
//   } else if (!reviewer_name) {
//     return res.status(401).json({ message: "Reviewer's name is mandatory" });
//   }
//   let creation;
//   try {
//     const folderName = `${
//       process.env.CLOUDINARY_DB
//     }/testimonial${new Date().toISOString()}`;

//     if (pictures[0]?.includes("video")) {
//       // Await the promise to ensure it resolves before proceeding
//       const uploadTesVid = await uploadLargeVideoInChunks(
//         pictures[0],
//         folderName
//       );

//       if (uploadTesVid) {
//         creation = await Testimonial.create({
//           reviewer_name,
//           reviewer_location,
//           client_rating,
//           review,
//           pictures: [
//             {
//               public_id: uploadTesVid?.public_id,
//               url: uploadTesVid?.url,
//               secure_url: uploadTesVid?.secure_url,
//               resource_type: uploadTesVid?.resource_type,
//               folder: uploadTesVid?.folder,
//             },
//           ],
//         });
//       }
//     } else if (pictures[0]?.includes("image")) {
//       // Handle image uploads or other logic
//       const uploadPromises = pictures?.map((base64Data) => {
//         return cloudinary.uploader.upload(base64Data, {
//           folder: folderName,
//         });
//       });
//       const uploadedImages = await Promise.all(uploadPromises);

//       if (!uploadedImages || uploadedImages.length !== pictures.length) {
//         return res.status(400).json({
//           message: "Failed to upload one or more images to Cloudinary",
//         });
//       }
//       creation = await Testimonial.create({
//         reviewer_name,
//         review,
//         pictures: [],
//       });
//       await creation.update({
//         pictures: [
//           {
//             public_id: uploadedImages[0]?.public_id,
//             url: uploadedImages[0]?.url,
//             secure_url: uploadedImages[0]?.secure_url,
//             resource_type: uploadedImages[0]?.resource_type,
//             folder: uploadedImages[0]?.folder,
//           },
//         ],
//       });
//     } else if (!pictures?.length) {
//       creation = await Testimonial.create({
//         reviewer_name,
//         review,
//         pictures: [],
//       });
//     }
//     if (creation) {
//       res.status(200).json({
//         message: "Testimonial created successfully",
//       });
//     }
//   } catch (error) {
//     console.log("Error uploading video:", error);

//     res.status(500).json({
//       message: error.message,
//       error: error.message,
//     });
//   }
// };
// const uploadLargeVideoInChunks = async (base64Video, folderName) => {
//   try {
//     const uploadStream = await cloudinary.uploader.upload_large(base64Video, {
//       resource_type: "video",
//       folder: folderName,
//     });
//     return uploadStream;
//   } catch (error) {
//     if (error?.http_code == 413) {
//       Object.assign(error, { message: "File Size exceeds 100MB" });
//       throw error;
//     } else {
//       console.log("error", error);
//       throw error; // Ensure error is thrown to be caught in calling function
//     }
//   }
// };
// exports.deleteTestimonial = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const testimonial = await Testimonial.findByPk(id);
//     if (!testimonial) {
//       return res.status(404).json({ message: "Testimonial not found" });
//     }

//     const { pictures } = testimonial;
//     if (pictures && pictures.length > 0) {
//       // Get folder name from the first picture's folder property
//       const folderName = pictures[0]?.folder;

//       // Delete all images and videos associated with the testimonial
//       const deletePromises = pictures.map((picture) =>
//         cloudinary.uploader.destroy(picture?.public_id, {
//           resource_type: picture?.resource_type || "image",
//         })
//       );

//       await Promise.all(deletePromises);

//       // Check and delete any remaining files in the folder for both images and videos
//       const types = ["image", "video"];
//       for (const type of types) {
//         const filesInFolder = await cloudinary.api.resources({
//           type: "upload",
//           prefix: folderName,
//           resource_type: type,
//         });

//         const deleteFilePromises = filesInFolder.resources.map((file) =>
//           cloudinary.uploader.destroy(file?.public_id, { resource_type: type })
//         );

//         await Promise.all(deleteFilePromises);
//       }

//       // Finally, delete the folder itself if it's empty
//       await cloudinary.api.delete_folder(folderName);
//     }

//     // Delete the testimonial from the database
//     await testimonial.destroy();

//     res.status(200).json({ message: "Testimonial deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to delete testimonial", error: error.message });
//   }
// };
