import { ModuleType } from "./../models/Module";
import express from "express";
import Course, { CourseType } from "../models/Course";
import Module from "../models/Module";

import { parseCourseRepository } from "../services/loadGithubRepository";
import { v4 as uuid } from "uuid";
import {
  deleteModule,
  constructModule,
  deconstructModule,
} from "../services/module";
import destructureDocument from "../services/destructureDocument";

const router = express.Router();

router.post("/", async (req, res) => {
  const existingCourse = await Course.findOne({
    repoUrl: req.body.repo,
  });

  console.log(existingCourse);

  if (existingCourse !== null) {
    res.status(400).json({
      error: "Course already uploaded",
    });
    return;
  }

  const repo = req.body.repo;
  // @ts-ignore
  const course: CourseType = {
    id: uuid(),
  };

  try {
    Object.assign(course, await parseCourseRepository(repo));
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: "Could not parse course repository",
    });
    return;
  }

  await deconstructModule(course.rootModule);

  const { rootModule, ...rest } = course;
  const courseDoc = new Course({
    ...rest,
    rootModuleId: rootModule.id,
  });

  try {
    await courseDoc.save();
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }

  return res.status(200).json({
    course: {
      ...course,
      id: courseDoc.id,
    },
  });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findOneAndDelete({ id: id });
    const rootModuleId = course.rootModuleId;
    await deleteModule(rootModuleId);

    return res.status(200).json({
      course: course,
    });
  } catch (e) {
    return res.status(500).json({
      message: `Invalid course id: ${id}`,
      error: e,
    });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const courseDoc = await Course.findOne({ id: id });
    const rootModule = await constructModule(courseDoc.rootModuleId);

    const { rootModuleId, ...rest } = destructureDocument(courseDoc);

    const course: CourseType = {
      ...rest,
      rootModule: rootModule,
    };

    return res.status(200).json({
      course: course,
    });
  } catch (e) {
    return res.status(500).json({
      message: `Invalid course id: ${id}`,
      error: e,
    });
  }
});

router.get("/", async (req, res) => {
  const courses = await Course.find();
  return res.json({
    courses,
  });
});

export default router;
