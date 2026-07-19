/**
 * GitHub API 集成 - 用于在 Vercel 部署环境写入文件
 * 需要在 Vercel 环境变量中配置：
 *   - GITHUB_TOKEN: Personal Access Token (scope: repo)
 *   - GITHUB_OWNER: 仓库所有者用户名 (默认: liusongrui666)
 *   - GITHUB_REPO: 仓库名 (默认: liusongrui666-github-io)
 *   - GITHUB_BRANCH: 分支名 (默认: main)
 */

export interface GitHubFile {
  path: string;
  content: string | Buffer;
  encoding?: "utf-8" | "base64";
}

export interface GitHubCommitResult {
  success: boolean;
  commitUrl?: string;
  error?: string;
}

const OWNER = process.env.GITHUB_OWNER || "liusongrui666";
const REPO = process.env.GITHUB_REPO || "liusongrui666-github-io";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;

export function isGitHubConfigured(): boolean {
  return Boolean(TOKEN);
}

function getHeaders() {
  if (!TOKEN) {
    throw new Error("GITHUB_TOKEN 未配置");
  }
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

async function getFileSha(filePath: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as { sha: string };
    return data.sha;
  } catch {
    return null;
  }
}

/**
 * 在仓库的指定分支上创建/更新文件
 */
export async function commitFiles(
  files: GitHubFile[],
  message: string
): Promise<GitHubCommitResult> {
  if (!TOKEN) {
    return {
      success: false,
      error:
        "GITHUB_TOKEN 未配置。请在 Vercel 环境变量中添加 GITHUB_TOKEN（Personal Access Token with repo scope）",
    };
  }

  try {
    // 1. 获取分支最新 commit SHA
    const refRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`,
      { headers: getHeaders() }
    );
    if (!refRes.ok) {
      return { success: false, error: `获取分支失败: ${refRes.status}` };
    }
    const refData = (await refRes.json()) as { object: { sha: string } };
    const latestCommitSha = refData.object.sha;

    // 2. 获取该 commit 的 tree
    const commitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`,
      { headers: getHeaders() }
    );
    if (!commitRes.ok) {
      return { success: false, error: `获取 commit 失败: ${commitRes.status}` };
    }
    const commitData = (await commitRes.json()) as { tree: { sha: string } };
    const baseTreeSha = commitData.tree.sha;

    // 3. 为每个文件创建 blob
    const tree = await Promise.all(
      files.map(async (file) => {
        const isBinary = file.content instanceof Buffer;
        const content = isBinary
          ? (file.content as Buffer).toString("base64")
          : Buffer.from(file.content as string, "utf-8").toString("base64");
        const blobRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ content, encoding: "base64" }),
          }
        );
        if (!blobRes.ok) {
          throw new Error(`创建 blob 失败: ${blobRes.status}`);
        }
        const blob = (await blobRes.json()) as { sha: string };
        return {
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        };
      })
    );

    // 4. 创建新 tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree,
        }),
      }
    );
    if (!treeRes.ok) {
      return { success: false, error: `创建 tree 失败: ${treeRes.status}` };
    }
    const newTree = (await treeRes.json()) as { sha: string };

    // 5. 创建新 commit
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/commits`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          message,
          tree: newTree.sha,
          parents: [latestCommitSha],
        }),
      }
    );
    if (!newCommitRes.ok) {
      return { success: false, error: `创建 commit 失败: ${newCommitRes.status}` };
    }
    const newCommit = (await newCommitRes.json()) as { sha: string };

    // 6. 更新分支引用
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ sha: newCommit.sha }),
      }
    );
    if (!updateRefRes.ok) {
      return { success: false, error: `更新分支失败: ${updateRefRes.status}` };
    }

    return {
      success: true,
      commitUrl: `https://github.com/${OWNER}/${REPO}/commit/${newCommit.sha}`,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

/**
 * 检查文件是否已存在（用于跳过重复）
 */
export async function fileExists(filePath: string): Promise<boolean> {
  const sha = await getFileSha(filePath);
  return sha !== null;
}
