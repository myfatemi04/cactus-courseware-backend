import { ModuleType } from './../models/Module';
import express from "express";
import Course, { CourseType } from "../models/Course";
import Module from '../models/Module';

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
    .then((courses) => res.json(courses))
    .catch((err) => res.status(500).json(err));
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

router.delete('/course/:id', async (req, res) => {
  const { id } = req.params;
  const course = await Course.findOneAndDelete({id: id});
  const rootModuleId = course.rootModuleId;

  const deleteModule = async (moduleId: string) => {
    const moduleDoc = await Module.findOneAndDelete({id: moduleId})
    if(moduleDoc != null){
      for(let childId of moduleDoc.childrenIds){
        await deleteModule(childId);
      }
    }
    return moduleDoc;
  };

  await deleteModule(rootModuleId);
  return res.status(200).json({
    course: course
  })
})

router.post("/course", async (req, res) => {
  const repo = req.body.repo;
  const course: Omit<CourseType, "id"> = await parseCourseRepository(repo);

  const makeModule = async (module: ModuleType) => {
    const { children, ...rest} = module;

    const moduleDoc = new Module({
      ...rest,
      childrenIds: children.map((child: ModuleType) => child.id)
    })
    await moduleDoc.save();

    for(let mod of children){
      await makeModule(mod);
    }
    return moduleDoc;
  };

  await makeModule(course.rootModule);

  const courseDoc = new Course({
    id: uuid(),
    title: course.rootModule.title,
    description: course.description,
    tags: course.tags,
    thumbnail: course.thumbnail,
    authors: course.authors,
    rootModuleId: course.rootModule.id,
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

export default router;
