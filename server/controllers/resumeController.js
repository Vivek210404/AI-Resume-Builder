import imageKit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";


// controller for creating  a resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        // create new resume
        const newResume = await Resume.create({ userId, title });
        // return success message
        return res
            .status(201)
            .json({ message: "Resume Created Successfully!", resume: newResume });
    } catch (error) {
        console.error("Error creating resume:", error);
        return res.status(500).json({ message: error.message });
    }
}

// controller for deleting  a resume
// POST: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const result = await Resume.findOneAndDelete({ userId, _id: resumeId });

        if (!result) {
            return res
                .status(404)
                .json({ message: "Resume Not Found or Unauthorized." });
        }

        // return success message
        return res.status(200).json({ message: "Resume Deleted Successfully!" });
    } catch (error) {
        console.error("Error deleting resume:", error);
        return res.status(500).json({ message: error.message });
    }
};

// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId });

        if (!resume) {
            return res.status(404).json({ message: "Resume Not Found!" });
        }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({ resume });
    } catch (error) {
        console.error("Error fetching resume by ID:", error);
        return res.status(500).json({ message: error.message });
    }
};

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ public: true, _id: resumeId });

        if (!resume) {
            return res
                .status(404)
                .json({ message: "Resume Not Found or Not Public." });
        }

        return res.status(200).json({ resume });
    } catch (error) {
        console.error("Error fetching public resume:", error);
        return res.status(500).json({ message: error.message });
    }
};

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;

        const { resumeId, resumeData, removeBackground } = req.body;
        const image = req.file; // File object provided by Multer middleware.

        let resumeDataCopy;
        if (typeof resumeData === "string") {
            resumeDataCopy = await JSON.parse(resumeData);
        } else {
            resumeDataCopy = structuredClone(resumeData);
        }

        if (image) {
            const imageBufferData = fs.createReadStream(image.path);
            const preTransform = "w-300, h-300, fo-face, z-0.75" +
                (removeBackground ? ",e-bgremove" : "");
            const fallbackTransform = "w-300, h-300" +
                (removeBackground ? ",e-bgremove" : "");

            let response;
            try {
                response = await imageKit.files.upload({
                    file: imageBufferData,
                    fileName: `resume-profile-${userId}.png`,
                    folder: "user-resumes",
                    transformation: { pre: preTransform },
                });
            } catch (transformError) {
                const fallbackBuffer = fs.createReadStream(image.path);
                response = await imageKit.files.upload({
                    file: fallbackBuffer,
                    fileName: `resume-profile-${userId}.png`,
                    folder: "user-resumes",
                    transformation: { pre: fallbackTransform },
                });
            }

            fs.unlink(image.path, (err) => {
                if (err) console.error("Error deleting local temp file:", err);
            });

            resumeDataCopy.personal_info.image = response.url;
        }

        const resume = await Resume.findByIdAndUpdate({ userId, _id: resumeId }, { $set: resumeDataCopy }, { new: true });
        return res.status(200).json({
            message: "Saved Successfully!",
            resume,
        });
    } catch (error) {
        console.error("Error updating resume:", error);
        return res.status(500).json({ message: error.message });
    }
}