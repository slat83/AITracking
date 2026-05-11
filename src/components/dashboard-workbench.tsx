"use client";

import { useEffect, useState } from "react";

type DashboardKeywordRecord = {
  id: string;
  keyword: string;
  createdAt: string;
  updatedAt: string;
};

type DashboardThreadRecord = {
  id: string;
  url: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

type DashboardPostRecord = {
  id: string;
  url: string;
  title: string | null;
  subreddit: string | null;
  author: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type DashboardSnapshot = {
  keywords: DashboardKeywordRecord[];
  threads: DashboardThreadRecord[];
  postsToAnswer: DashboardPostRecord[];
  answeredPosts: DashboardPostRecord[];
};

const EMPTY_DASHBOARD: DashboardSnapshot = {
  keywords: [],
  threads: [],
  postsToAnswer: [],
  answeredPosts: [],
};

function splitBulkInput(value: string) {
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not answered";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

type DashboardLoadResult = {
  snapshot: DashboardSnapshot;
  error: string | null;
};

type DashboardLoadSections = {
  keywords: PromiseSettledResult<{ keywords: DashboardKeywordRecord[] }>;
  threads: PromiseSettledResult<{ threads: DashboardThreadRecord[] }>;
  posts: PromiseSettledResult<{ postsToAnswer: DashboardPostRecord[]; answeredPosts: DashboardPostRecord[] }>;
};

export function buildDashboardLoadResult(results: DashboardLoadSections): DashboardLoadResult {
  const errors: string[] = [];

  if (results.keywords.status === "rejected") {
    errors.push(`Keywords: ${results.keywords.reason instanceof Error ? results.keywords.reason.message : "Failed to load."}`);
  }

  if (results.threads.status === "rejected") {
    errors.push(`Threads: ${results.threads.reason instanceof Error ? results.threads.reason.message : "Failed to load."}`);
  }

  if (results.posts.status === "rejected") {
    errors.push(`Posts: ${results.posts.reason instanceof Error ? results.posts.reason.message : "Failed to load."}`);
  }

  return {
    snapshot: {
      keywords: results.keywords.status === "fulfilled" ? results.keywords.value.keywords : [],
      threads: results.threads.status === "fulfilled" ? results.threads.value.threads : [],
      postsToAnswer: results.posts.status === "fulfilled" ? results.posts.value.postsToAnswer : [],
      answeredPosts: results.posts.status === "fulfilled" ? results.posts.value.answeredPosts : [],
    },
    error: errors.length > 0 ? errors.join(" ") : null,
  };
}

export function DashboardWorkbench() {
  const [dashboard, setDashboard] = useState<DashboardSnapshot>(EMPTY_DASHBOARD);
  const [keywordInput, setKeywordInput] = useState("");
  const [threadInput, setThreadInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [keywordsResult, threadsResult, postsResult] = await Promise.allSettled([
          (async () => readJson<{ keywords: DashboardKeywordRecord[] }>(await fetch("/api/keywords", { cache: "no-store" })))(),
          (async () => readJson<{ threads: DashboardThreadRecord[] }>(await fetch("/api/threads", { cache: "no-store" })))(),
          (async () => readJson<{ postsToAnswer: DashboardPostRecord[]; answeredPosts: DashboardPostRecord[] }>(
            await fetch("/api/posts", { cache: "no-store" }),
          ))(),
        ]);

        if (!active) {
          return;
        }

        const { snapshot, error: loadError } = buildDashboardLoadResult({
          keywords: keywordsResult,
          threads: threadsResult,
          posts: postsResult,
        });

        setDashboard(snapshot);
        setError(loadError);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function submitKeywords() {
    const keywords = splitBulkInput(keywordInput);

    if (keywords.length === 0) {
      setError("Add at least one keyword.");
      return;
    }

    try {
      setPendingAction("keywords");
      setError(null);

      const payload = await readJson<{ keywords: DashboardKeywordRecord[] }>(await fetch("/api/keywords", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ keywords }),
      }));

      setDashboard((current) => ({ ...current, keywords: payload.keywords }));
      setKeywordInput("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add keywords.");
    } finally {
      setPendingAction(null);
    }
  }

  async function removeKeyword(id: string) {
    try {
      setPendingAction(`keyword-${id}`);
      setError(null);

      const payload = await readJson<{ keywords: DashboardKeywordRecord[] }>(await fetch("/api/keywords", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
      }));

      setDashboard((current) => ({ ...current, keywords: payload.keywords }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to remove keyword.");
    } finally {
      setPendingAction(null);
    }
  }

  async function submitThreads() {
    const urls = splitBulkInput(threadInput);

    if (urls.length === 0) {
      setError("Add at least one Reddit thread URL.");
      return;
    }

    try {
      setPendingAction("threads");
      setError(null);

      const payload = await readJson<{ threads: DashboardThreadRecord[] }>(await fetch("/api/threads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          threads: urls.map((url) => ({ url })),
        }),
      }));

      setDashboard((current) => ({ ...current, threads: payload.threads }));
      setThreadInput("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add tracked threads.");
    } finally {
      setPendingAction(null);
    }
  }

  async function removeThread(id: string) {
    try {
      setPendingAction(`thread-${id}`);
      setError(null);

      const payload = await readJson<{ threads: DashboardThreadRecord[] }>(await fetch("/api/threads", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
      }));

      setDashboard((current) => ({ ...current, threads: payload.threads }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to remove tracked thread.");
    } finally {
      setPendingAction(null);
    }
  }

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const url = String(formData.get("url") ?? "").trim();

    if (!url) {
      setError("A post URL is required.");
      return;
    }

    try {
      setPendingAction("posts");
      setError(null);

      const payload = await readJson<{
        postsToAnswer: DashboardPostRecord[];
        answeredPosts: DashboardPostRecord[];
      }>(await fetch("/api/posts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url,
          title: String(formData.get("title") ?? "").trim() || undefined,
          subreddit: String(formData.get("subreddit") ?? "").trim() || undefined,
          author: String(formData.get("author") ?? "").trim() || undefined,
        }),
      }));

      setDashboard((current) => ({
        ...current,
        postsToAnswer: payload.postsToAnswer,
        answeredPosts: payload.answeredPosts,
      }));
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add tracked post.");
    } finally {
      setPendingAction(null);
    }
  }

  async function answerPost(id: string) {
    try {
      setPendingAction(`post-${id}`);
      setError(null);

      const payload = await readJson<{
        postsToAnswer: DashboardPostRecord[];
        answeredPosts: DashboardPostRecord[];
      }>(await fetch("/api/posts", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
      }));

      setDashboard((current) => ({
        ...current,
        postsToAnswer: payload.postsToAnswer,
        answeredPosts: payload.answeredPosts,
      }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to move post to answered.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <section className="statsGrid dashboardHeader workspaceStats">
        <article className="card dashboardCard">
          <p className="muted">Tracked keywords</p>
          <p className="statValue">{dashboard.keywords.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Tracked threads</p>
          <p className="statValue">{dashboard.threads.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Posts to answer</p>
          <p className="statValue">{dashboard.postsToAnswer.length}</p>
        </article>
        <article className="card dashboardCard">
          <p className="muted">Answered posts</p>
          <p className="statValue">{dashboard.answeredPosts.length}</p>
        </article>
      </section>

      {error ? (
        <section className="card dashboardCard workflowMessage workflowMessageError">{error}</section>
      ) : null}

      <section className="shellGrid">
        <article className="shellSection">
          <div className="shellSectionHeader">
            <div>
              <h2>Tracked keywords</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Add one or more discovery phrases. Separate entries with commas or new lines.
              </p>
            </div>
          </div>
          <label className="field">
            <span>Keywords</span>
            <textarea
              disabled={loading || pendingAction === "keywords"}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="best vin decoder&#10;vin check legit"
              rows={4}
              value={keywordInput}
            />
          </label>
          <div className="buttonRow">
            <button
              className="button buttonPrimary"
              disabled={loading || pendingAction === "keywords"}
              onClick={() => void submitKeywords()}
              type="button"
            >
              {pendingAction === "keywords" ? "Saving..." : "Add keywords"}
            </button>
          </div>
          <div className="workspaceChecklist">
            {dashboard.keywords.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No keywords tracked yet.</strong>
              </div>
            ) : (
              dashboard.keywords.map((keyword) => (
                <article className="workspaceChecklistItem" key={keyword.id}>
                  <div className="workspaceChecklistHeader">
                    <strong>{keyword.keyword}</strong>
                    <button
                      className="button buttonSecondary"
                      disabled={pendingAction === `keyword-${keyword.id}`}
                      onClick={() => void removeKeyword(keyword.id)}
                      type="button"
                    >
                      {pendingAction === `keyword-${keyword.id}` ? "Removing..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="shellSection">
          <div className="shellSectionHeader">
            <div>
              <h2>Tracked Reddit threads</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Add one or more Reddit thread URLs to keep them visible in the operator queue.
              </p>
            </div>
          </div>
          <label className="field">
            <span>Thread URLs</span>
            <textarea
              disabled={loading || pendingAction === "threads"}
              onChange={(event) => setThreadInput(event.target.value)}
              placeholder="https://www.reddit.com/r/saas/comments/example/thread-title/"
              rows={4}
              value={threadInput}
            />
          </label>
          <div className="buttonRow">
            <button
              className="button buttonPrimary"
              disabled={loading || pendingAction === "threads"}
              onClick={() => void submitThreads()}
              type="button"
            >
              {pendingAction === "threads" ? "Saving..." : "Add threads"}
            </button>
          </div>
          <div className="workspaceChecklist">
            {dashboard.threads.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No threads tracked yet.</strong>
              </div>
            ) : (
              dashboard.threads.map((thread) => (
                <article className="workspaceChecklistItem" key={thread.id}>
                  <div className="workspaceChecklistHeader">
                    <div>
                      <strong>{thread.title ?? "Tracked Reddit thread"}</strong>
                      <p className="muted">{thread.url}</p>
                    </div>
                    <button
                      className="button buttonSecondary"
                      disabled={pendingAction === `thread-${thread.id}`}
                      onClick={() => void removeThread(thread.id)}
                      type="button"
                    >
                      {pendingAction === `thread-${thread.id}` ? "Removing..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="shellSection shellSectionSpan2">
          <div className="shellSectionHeader">
            <div>
              <h2>Posts to answer</h2>
              <p className="muted" style={{ marginTop: 8 }}>
                Removing a post from the active queue marks it answered and keeps it visible below.
              </p>
            </div>
          </div>
          <form className="stack" onSubmit={(event) => void submitPost(event)}>
            <div className="workflowFormGrid">
              <label className="field">
                <span>Post URL</span>
                <input disabled={loading || pendingAction === "posts"} name="url" required />
              </label>
              <label className="field">
                <span>Title</span>
                <input disabled={loading || pendingAction === "posts"} name="title" />
              </label>
              <label className="field">
                <span>Subreddit</span>
                <input disabled={loading || pendingAction === "posts"} name="subreddit" />
              </label>
              <label className="field">
                <span>Author</span>
                <input disabled={loading || pendingAction === "posts"} name="author" />
              </label>
            </div>
            <div className="buttonRow">
              <button className="button buttonPrimary" disabled={loading || pendingAction === "posts"} type="submit">
                {pendingAction === "posts" ? "Saving..." : "Add post"}
              </button>
            </div>
          </form>
          <div className="shellGrid">
            <article className="workspaceInlineCard">
              <div className="workspaceSectionTitleRow">
                <h3>Active queue</h3>
                <span className="pill">{dashboard.postsToAnswer.length}</span>
              </div>
              <div className="workspaceChecklist">
                {dashboard.postsToAnswer.length === 0 ? (
                  <div className="workspaceEmptyState">
                    <strong>No posts waiting for an answer.</strong>
                  </div>
                ) : (
                  dashboard.postsToAnswer.map((post) => (
                    <article className="workspaceChecklistItem" key={post.id}>
                      <div className="workspaceChecklistHeader">
                        <div>
                          <strong>{post.title ?? post.url}</strong>
                          <p className="muted">{post.subreddit ? `r/${post.subreddit}` : "No subreddit"} · {post.author ?? "Unknown author"}</p>
                          <p className="muted">{post.url}</p>
                        </div>
                        <button
                          className="button buttonSecondary"
                          disabled={pendingAction === `post-${post.id}`}
                          onClick={() => void answerPost(post.id)}
                          type="button"
                        >
                          {pendingAction === `post-${post.id}` ? "Moving..." : "Mark answered"}
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </article>

            <article className="workspaceInlineCard">
              <div className="workspaceSectionTitleRow">
                <h3>Answered posts</h3>
                <span className="pill">{dashboard.answeredPosts.length}</span>
              </div>
              <div className="workspaceChecklist">
                {dashboard.answeredPosts.length === 0 ? (
                  <div className="workspaceEmptyState">
                    <strong>No answered posts yet.</strong>
                  </div>
                ) : (
                  dashboard.answeredPosts.map((post) => (
                    <article className="workspaceChecklistItem" key={post.id}>
                      <div className="workspaceChecklistHeader">
                        <div>
                          <strong>{post.title ?? post.url}</strong>
                          <p className="muted">{post.subreddit ? `r/${post.subreddit}` : "No subreddit"} · {post.author ?? "Unknown author"}</p>
                          <p className="muted">{post.url}</p>
                        </div>
                        <span className="pill">{formatDateTime(post.answeredAt)}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </article>
          </div>
        </article>
      </section>
    </>
  );
}
