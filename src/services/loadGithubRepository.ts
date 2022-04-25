import { CourseType } from "../models/Course";
import { ModuleType } from "../models/Module";
import { v4 as uuid } from "uuid";
import { getGithubFileText, getGithubFolderContent } from "./githubLoader";
import { GithubFolderResponse, Structure } from "./githubTypes";
import { parseOCW } from "./parseOCW";

export async function parseCourseData(repo: string) {
  let text: string;
  try {
    text = await getGithubFileText(repo, "ocw.txt");
  } catch (e) {
    console.log(e);
    throw new Error("Could not find ocw.txt");
  }

  const { data, structure } = parseOCW(text);
  const metadata = {
    repoUrl: repo,
    title: data.title,
    tags: data.tags,
    thumbnail: data.thumbnail,
    description: data.description,
    structure: structure
  }

  return metadata;
}

export async function parseUnitFile(
  repo: string,
  path: string,
  underscores=true
): Promise<Omit<ModuleType, "id">> {
  // Parses a file, such as "01_Strings.md"
  const match = path.match(/(?<=\/)(\w+)(.md|.ipynb)/)!;
  if (match === null) {
    return {
      title: "",
      content: "",
      type: "markdown",
      children: []
    };
  }

  const [_, fileName, fileType] = match;
  let unitName: string;
  if (underscores === true) {
    unitName = fileName.slice(fileName.indexOf("_") + 1).replace(/_/g, " ");
  }
  else {
    unitName = fileName;
  }
  const content = await getGithubFileText(repo, path);
  return {
    title: unitName,
    content,
    type: fileType === ".md" ? "markdown" : "jupyter",
    children: [],
  };
}

export async function parseUnitDirectoryWithStructure(
  repo: string,
  path: string,
  structure: Structure
): Promise<Omit<ModuleType, "id">> {
  const module: Omit<ModuleType, "id"> = {
    title: "",
    content: "",
    type: "markdown",
    children: [],
  };

  const folder = await getGithubFolderContent(repo, path);
  // folder name starts after last slash, i.e content/01_Strings/ -> 01_Strings
  const folderName = path.slice(path.lastIndexOf("/") + 1);
  const unitName = folderName

  try {
    const result = await getGithubFileText(repo, path + "/index.md");
    module.content = result !== "" ? result : module.content;
    module.type = result !== "" ? "markdown" : module.type;
  } catch (e) {
    // No index.md
  }

  try {
    const result = await getGithubFileText(repo, path + "/index.ipynb");
    module.content = result !== "" ? result : module.content;
    module.type = result !== "" ? "jupyter" : module.type;
  } catch (e) {
    // No index.ipynb
  }

  module.title = unitName;

  // sort based on order in structure
  const childrenTitles = structure.children.map(child => child.title);
  const filteredFolder = folder.filter(child => (childrenTitles.includes(child.name) || child.name === structure.title));
  const sortedFolder = filteredFolder.sort((a, b) => childrenTitles.indexOf(a.name) - childrenTitles.indexOf(b.name));
  for (const file of sortedFolder) {
    if (file.type === "dir") {
        module.children.push({
          ...(await parseUnitDirectoryWithStructure(repo, file.path, structure.children[childrenTitles.indexOf(file.name)])),
          id: uuid(),
        });
      }
    else if (file.type === "file") {
      // Unit Files
      if (file.name === "index.md") {
        module.content = await getGithubFileText(repo, file.path);
        module.type = "markdown";
      } else {
        // 
        if (file.name) {
          const unitFile = await parseUnitFile(repo, file.path, false)
          if (unitFile.title !== "") {
            module.children.push({
              ...(unitFile),
              id: uuid(),
            });
          }
        }
      }
    }
  }
  return module;
}

export async function parseUnitDirectory(
  repo: string,
  path: string
): Promise<Omit<ModuleType, "id">> {
  const module: Omit<ModuleType, "id"> = {
    title: "",
    content: "",
    type: "markdown",
    children: [],
  };

  const folder = await getGithubFolderContent(repo, path);
  const folderName = path.slice(path.lastIndexOf("/") + 1);
  const unitNumber = folderName.slice(0, folderName.indexOf("_"));
  const unitName = folderName
    .slice(folderName.indexOf("_") + 1)
    .replace(/_/g, " ");

  try {
    module.content = await getGithubFileText(repo, path + "/index.md");
    module.type = "markdown";
  } catch (e) {
    // No index.md
  }

  try {
    module.content = await getGithubFileText(repo, path + "/index.ipynb");
    module.type = "jupyter";
  } catch (e) {
    // No index.ipynb
  }

  module.title = unitName;

  for (const file of folder.sort((a, b) => a.name.localeCompare(b.name))) {
    if (file.type === "dir") {
      // Unit Directories
      module.children.push({
        ...(await parseUnitDirectory(repo, file.path)),
        id: uuid(),
      });
    } else if (file.type === "file") {
      // Unit Files
      if (file.name === "index.md") {
        module.content = await getGithubFileText(repo, file.path);
        module.type = "markdown";
      } else {
        if (/\d+_/.test(file.name)) {
          module.children.push({
            ...(await parseUnitFile(repo, file.path)),
            id: uuid(),
          });
        }
      }
    }
  }

  return module;
}

export async function parseCourseRepository(
  repo: string
): Promise<Omit<CourseType, "id">> {
  const metadata = await parseCourseData(repo);
  const root = await getGithubFolderContent(repo, "content");
  const course: Omit<CourseType, "id"> = {
    ...metadata,
    rootModule: {
      ...(metadata.structure == undefined ? await parseUnitDirectory(repo, "content") : await parseUnitDirectoryWithStructure(repo, "content", metadata.structure)),
      id: uuid(),
    },
  };
  return course;
}
