import { GithubFileResponse, GithubFolderResponse } from "./githubTypes";
import fetch from "node-fetch";

export async function getGithubFolderContent(
  repo: string,
  path: string
): Promise<GithubFolderResponse> {
  const options = {
    headers: {
      'Authorization': `token ${process.env.GITHUB_AUTH_PAT}`
    }
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, options);
  const json = await response.json();
  return json;
}

export async function getGithubFileText(
  repo: string,
  path: string
): Promise<string> {
  const options = {
    headers: {
      'Authorization': `token ${process.env.GITHUB_AUTH_PAT}`
    }
  }

  const response:any = await (
    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, options)
  ).json();
  if(response.message && response.message == 'Not Found') return '';
  
  const content = response.content.replace(/\n/g, "");
  const text = Buffer.from(content, "base64").toString("ascii");
  return text;
}