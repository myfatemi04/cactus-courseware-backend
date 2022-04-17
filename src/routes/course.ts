import { ModuleType } from './../models/Module';
import express from "express";
import Course, { CourseType } from "../models/Course";
import Module from '../models/Module';

import { parseCourseRepository } from "../services/loadGithubRepository";
import { v4 as uuid } from "uuid";
import { deleteModule, constructModule, deconstructModule } from '../services/module';
import destructureDocument from '../services/destructureDocument';

const router = express.Router();

router.post("/", async (req, res) => {
  const repo = req.body.repo;
  const course: CourseType = {id: uuid(), ...(await parseCourseRepository(repo))};
  await deconstructModule(course.rootModule);

  const {rootModule, ...rest} = course;
  const courseDoc = new Course({
    ...rest,
    id: rootModule.id
  })

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
      id: courseDoc.id
    }
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const course = await Course.findOneAndDelete({id: id});
  const rootModuleId = course.rootModuleId;

  await deleteModule(rootModuleId);
  return res.status(200).json({
    course: course
  })
})

router.get('/:id', async (req, res) => {
  const {id} = req.params;

  const courseDoc = await Course.findOne({id: id});
  const rootModule = await constructModule(courseDoc.rootModuleId);

  const {rootModuleId, ...rest} = destructureDocument(courseDoc);

  const course: CourseType = {
    ...rest,
    rootModule: rootModule
  };

  return res.status(200).json({
    course: course
  })
})

export default router;