import { CourseType } from "../models/Course";
import fetch from "node-fetch";
import { GithubFileResponse } from "./githubTypes";

export async function getGithubFileText(
  repo: string,
  path: string
): Promise<string> {
  const README = (await (
    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`)
  ).json()) as GithubFileResponse;

  console.log(README);

  const content = README.content.replace(/\n/g, "");
  const text = Buffer.from(content, "base64").toString("ascii");

  return text;
}

export async function getCourseMetadata(repo: string): Promise<CourseType> {
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
    id: "TEMP_ID",
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
