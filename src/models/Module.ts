import mongoose from "mongoose";
// id: string (“user/repo”)
// title: string
// markdown: string
// tags: string[]
// modules: Module[] ← Parsed from repository content
// thumbnail: string ← Parsed from md
// authors: string ← Parsed from md

export interface ModuleType {
  id: string;
  children: ModuleType[];
  title: string;
  markdown: string;
}

const ModuleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  childrenIds: [
    {
      type: String,
    },
  ],
  markdown: {
    type: String,
    required: true,
  },
});

const Module = mongoose.model("Module", ModuleSchema);
export default Module;
