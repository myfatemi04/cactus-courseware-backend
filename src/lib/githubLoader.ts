import { GithubFileResponse, GithubFolderResponse } from "./githubTypes";
import fetch from "node-fetch";

const headers = {
  'Authorization': `${process.env.GITHUB_AUTH_USERNAME}:${process.env.GITHUB_AUTH_PAT}`
}

export async function getGithubFolderContent(
  repo: string,
  path: string
): Promise<GithubFolderResponse> {
  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {headers: headers});
  const json = await response.json();
  return json;
}

export async function getGithubFileText(
  repo: string,
  path: string
): Promise<string> {
  const response = (await (
    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {headers: headers})
  ).json()) as GithubFileResponse;

  const content = response.content.replace(/\n/g, "");
  const text = Buffer.from(content, "base64").toString("ascii");

  return text;
}