import { CourseType } from "../models/Course";
import fetch from "node-fetch";
import { GithubFileResponse, GithubFolderResponse } from "./githubTypes";
import { ModuleType } from "../models/Module";
import { v4 as uuid } from "uuid";

export async function getGithubFolderContent(
  repo: string,
  path: string
): Promise<GithubFolderResponse> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

export async function getGithubFileText(
  repo: string,
  path: string
): Promise<string> {
  const response = (await (
    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`)
  ).json()) as GithubFileResponse;

  const content = response.content.replace(/\n/g, "");
  const text = Buffer.from(content, "base64").toString("ascii");

  return text;
}

export async function parseCourseMetadata(
  repo: string
): Promise<Omit<CourseType, "rootModule" | "id">> {
  let text: string;
  try {
    text = await getGithubFileText(repo, "ocw.json");
  } catch (e) {
    throw new Error("Could not find ocw.json");
  }

  const metadata = JSON.parse(text) as {
    title: string;
    tags: string[];
    thumbnail: string;
    authors: string;
  };
  const markdown = await getGithubFileText(repo, "README.md");

  return {
    title: metadata.title,
    tags: metadata.tags,
    thumbnail: metadata.thumbnail,
    authors: metadata.authors,
    markdown,
  };

  /*
  id: string;
  title: string;
  markdown: string;
  tags: string[];
  // modules: Module[];
  thumbnail: string;
  authors: string;
  */
}

export async function parseUnitFile(
  repo: string,
  path: string
): Promise<Omit<ModuleType, "id">> {
  // Parses a file, such as "01_Strings.md"
  const fileName = path.slice(path.lastIndexOf("/") + 1);
  const unitNumber = fileName.slice(0, fileName.indexOf("_"));
  const unitName = fileName.slice(fileName.indexOf("_") + 1).replace(/_/g, " ");
  const content = await getGithubFileText(repo, path);

  return {
    title: unitName,
    markdown: content,
    children: [],
  };
}

export async function parseUnitDirectory(
  repo: string,
  path: string
): Promise<Omit<ModuleType, "id">> {
  const module: Omit<ModuleType, "id"> = {
    title: "",
    markdown: "",
    children: [],
  };

  const folder = await getGithubFolderContent(repo, path);
  const folderName = path.slice(path.lastIndexOf("/") + 1);
  const unitNumber = folderName.slice(0, folderName.indexOf("_"));
  const unitName = folderName
    .slice(folderName.indexOf("_") + 1)
    .replace(/_/g, " ");

  module.markdown = await getGithubFileText(repo, path + "/index.md");
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
        module.markdown = await getGithubFileText(repo, file.path);
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
  const metadata = await parseCourseMetadata(repo);
  const root = await getGithubFolderContent(repo, "content");
  const course: Omit<CourseType, "id"> = {
    ...metadata,
    rootModule: {
      ...(await parseUnitDirectory(repo, "content")),
      id: uuid(),
    },
  };

  return course;
}
