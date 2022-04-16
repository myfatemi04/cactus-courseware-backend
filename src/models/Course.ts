import mongoose from "mongoose";
import { ModuleType } from "./Module";

export interface CourseType {
  id: string;
  title: string;
  markdown: string;
  tags: string[];
  rootModule: ModuleType;
  thumbnail: string;
  authors: string;
}

const CourseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  thumbnail: {
    type: String,
  },
  authors: [
    {
      type: String,
    },
  ],
  rootModuleId: {
    type: String,
    required: true,
  },
});

const Course = mongoose.model("Course", CourseSchema);
export default Course;
