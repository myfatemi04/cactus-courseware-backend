import express from "express";
import Course from "../models/Course";
import { getCourseMetadata } from "../lib/loadGithubRepository";
import { v4 as uuid } from "uuid";

const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  return res.send("CourseWare API");
});

router.get("/repo_test/:user/:repo", (req, res) => {
  const { user, repo } = req.params;
  getCourseMetadata(user + "/" + repo)
    .then((data) => {
      res.json(data);
    })
    .catch((e) => {
      console.log("Error:", e);
      res.status(500).json(e);
    });
});

router.post("/course", async (req, res) => {
  const gh = req.body.githubUrl;

  const user = new Course({
    id: uuid(),
    title: gh,
    tags: ["math", "highschool"],
    thumbnail: "",
    authors: ["Jane Doe", "Joe Bo"],
    markdown: "## Test",
    rootModuleId: "random id",
  });

  try {
    await user.save();
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }

  return res.status(200).json({
    user: user,
  });
});

export default router;
