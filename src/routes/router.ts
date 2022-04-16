import express from "express";
import Course from "../models/Course";
import {
  parseCourseMetadata,
  parseCourseRepository,
} from "../lib/loadGithubRepository";
import { v4 as uuid } from "uuid";

const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  return res.send("CourseWare API");
});

router.get("/courses", (req, res) => {
  Course.find()
    .then((courses) => {
      return res.json(courses);
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
});

router.get("/repo_test/:user/:repo", (req, res) => {
  const { user, repo } = req.params;
  parseCourseRepository(user + "/" + repo)
    .then((data) => {
      res.json(data);
    })
    .catch((e) => {
      console.log("Error:", e);
      res.status(500).json(e);
    });
});

router.post("/course", async (req, res) => {
  const repo = req.body.repo;

  const metadata = await parseCourseMetadata(repo);

  const user = new Course({
    ...metadata,
    rootModuleId: "random id",
    id: uuid(),
  });

  try {
    await user.save();
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }

  return res.status(200).json({ user });
});

export default router;
