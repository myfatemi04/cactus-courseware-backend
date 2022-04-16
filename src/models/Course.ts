import mongoose from 'mongoose'
// id: string (“user/repo”)
// title: string
// markdown: string
// tags: string[]
// modules: Module[] ← Parsed from repository content
// thumbnail: string ← Parsed from md
// authors: string ← Parsed from md

const CourseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  thumbnail: {
    type: String
  },
  authors: [{
    type: String
  }],
  markdown: {
    type: String,
    required: true
  }
});

const Course = mongoose.model("Course", CourseSchema);
export default Course