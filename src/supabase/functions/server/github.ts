
// GitHub API Service
export async function getRepositories(token: string) {
  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vibe-Dev-Ops-Portal'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const repos = await response.json();
    return repos.map((repo: any) => ({
      id: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      url: repo.html_url
    }));
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    throw error;
  }
}

export async function createBranch(token: string, owner: string, repo: string, branchName: string, baseBranch: string = 'main') {
  try {
    // 1. Get the SHA of the base branch
    const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vibe-Dev-Ops-Portal'
      }
    });

    if (!refResponse.ok) {
      const error = await refResponse.text();
      // Try 'master' if 'main' fails
      if (baseBranch === 'main' && refResponse.status === 404) {
        console.log('Main branch not found, trying master...');
        return createBranch(token, owner, repo, branchName, 'master');
      }
      throw new Error(`Failed to get base branch SHA: ${refResponse.status} ${error}`);
    }

    const refData = await refResponse.json();
    const sha = refData.object.sha;

    // 2. Create the new reference (branch)
    const createResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vibe-Dev-Ops-Portal',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: sha
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      // If branch already exists, that's fine, just return success
      if (createResponse.status === 422) {
        console.log('Branch already exists, using existing one');
        return { success: true, created: false };
      }
      throw new Error(`Failed to create branch: ${createResponse.status} ${error}`);
    }

    return { success: true, created: true };
  } catch (error) {
    console.error('GitHub Create Branch Error:', error);
    throw error;
  }
}

export async function getBranches(token: string, owner: string, repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vibe-Dev-Ops-Portal'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const branches = await response.json();
    return branches.map((branch: any) => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected
    }));
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    throw error;
  }
}
