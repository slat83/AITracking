"use client";

import { useEffect, useMemo, useState } from "react";

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

type DashboardSearchState = {
  keywords: string;
  threads: string;
  postsToAnswer: string;
  answeredPosts: string;
};

const EMPTY_DASHBOARD: DashboardSnapshot = {
  keywords: [],
  threads: [],
  postsToAnswer: [],
  answeredPosts: [],
};

const EMPTY_SEARCH_STATE: DashboardSearchState = {
  keywords: "",
  threads: "",
  postsToAnswer: "",
  answeredPosts: "",
};

type DashboardWorkbenchProps = {
  initialDashboard?: DashboardSnapshot;
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

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function filterKeywords(keywords: DashboardKeywordRecord[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return keywords;
  }

  return keywords.filter((keyword) => keyword.keyword.toLowerCase().includes(normalizedQuery));
}

export function filterThreads(threads: DashboardThreadRecord[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return threads;
  }

  return threads.filter((thread) =>
    [thread.title, thread.url].some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );
}

export function filterPosts(posts: DashboardPostRecord[], query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return posts;
  }

  return posts.filter((post) =>
    [post.title, post.url, post.subreddit, post.author].some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );
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

type CommandAction = {
  id: string;
  command: string;
  item: string;
  owner: string;
  publishOrder: number;
  status: "Planned" | "Queued" | "Executing" | "Done";
  amplificationPriority: "High" | "Medium" | "Low";
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

export function DashboardWorkbench({ initialDashboard = EMPTY_DASHBOARD }: DashboardWorkbenchProps) {
  const [dashboard, setDashboard] = useState<DashboardSnapshot>(initialDashboard);
  const [search, setSearch] = useState<DashboardSearchState>(EMPTY_SEARCH_STATE);
  const [keywordInput, setKeywordInput] = useState("");
  const [threadInput, setThreadInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [singleCommand, setSingleCommand] = useState("Launch coordinated campaign");
  const [activeCommand, setActiveCommand] = useState("Launch coordinated campaign");

  const filteredKeywords = filterKeywords(dashboard.keywords, search.keywords);
  const filteredThreads = filterThreads(dashboard.threads, search.threads);
  const filteredPostsToAnswer = filterPosts(dashboard.postsToAnswer, search.postsToAnswer);
  const filteredAnsweredPosts = filterPosts(dashboard.answeredPosts, search.answeredPosts);

  const commandPlan = useMemo<CommandAction[]>(() => {
    const owners = ["Founder", "Company profile", "Employee advocate"];
    const sourcePriority = dashboard.postsToAnswer.slice(0, 3).map((post, index) => {
      return {
        id: `plan-post-${post.id}`,
        command: activeCommand,
        item: `Post: ${post.title ?? post.url}`,
        owner: owners[index % owners.length],
        publishOrder: index + 1,
        status: "Queued" as const,
        amplificationPriority: index < 1 ? "High" : index === 1 ? "Medium" : "Low",
      };
    });

    const answeredItems = dashboard.answeredPosts.slice(0, 2).map((post, index) => ({
      id: `plan-answered-${post.id}`,
      command: activeCommand,
      item: `Post: ${post.title ?? post.url}`,
      owner: owners[(index + 1) % owners.length],
      publishOrder: sourcePriority.length + index + 1,
      status: "Done" as const,
      amplificationPriority: "Low" as const,
    }));

    if (sourcePriority.length > 0) {
      if (answeredItems.length > 0) {
        answeredItems[0] = {
          ...answeredItems[0],
          status: "Done",
        };
      }
      return [...sourcePriority, ...answeredItems];
    }

    const keywordPlan = dashboard.keywords.slice(0, 3).map((keyword, index) => ({
      id: `plan-keyword-${keyword.id}`,
      command: activeCommand,
      item: `Create a post angle from keyword: ${keyword.keyword}`,
      owner: owners[index % owners.length],
      publishOrder: index + 1,
      status: "Planned" as const,
      amplificationPriority: index < 1 ? "High" : index === 1 ? "Medium" : "Low",
    }));

    if (dashboard.threads.length > 0) {
      return [
        ...keywordPlan,
        ...dashboard.threads.slice(0, 2).map((thread, index) => ({
          id: `plan-thread-${thread.id}`,
          command: activeCommand,
          item: `Share supporting insight from thread: ${thread.title ?? thread.url}`,
          owner: owners[(index + keywordPlan.length) % owners.length],
          publishOrder: keywordPlan.length + index + 1,
          status: "Planned" as const,
          amplificationPriority: "Medium" as const,
        })),
      ];
    }

    return [
      {
        id: "plan-empty",
        command: activeCommand,
        item: "No active inputs yet. Add keywords or tracked posts to build a plan.",
        owner: "Founder",
        publishOrder: 1,
        status: "Planned",
        amplificationPriority: "Medium",
      },
      {
        id: "plan-empty-support",
        command: activeCommand,
        item: "Run command after adding sources to generate concrete actions.",
        owner: "Employee advocate",
        publishOrder: 2,
        status: "Planned",
        amplificationPriority: "Low",
      },
    ];
  }, [activeCommand, dashboard.keywords, dashboard.threads, dashboard.postsToAnswer, dashboard.answeredPosts]);

  const nextAction = useMemo(
    () => commandPlan.find((action) => action.status === "Queued" || action.status === "Planned") ?? null,
    [commandPlan],
  );

  function updateSearchState(section: keyof DashboardSearchState, value: string) {
    setSearch((current) => ({
      ...current,
      [section]: value,
    }));
  }

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
      <section className="card dashboardCard workflowMessage workflowMessageNotice">
        <div className="shellSectionHeader">
          <div>
            <h2>Single-command execution queue</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Enter one campaign command, then use one queue for what to publish, who posts, when, and what gets extra push.
            </p>
          </div>
        </div>
        <div className="workflowFormGrid">
          <label className="field">
            <span>Campaign command</span>
            <input
              disabled={loading}
              onChange={(event) => setSingleCommand(event.target.value)}
              placeholder="e.g., Launch winter offer campaign"
              value={singleCommand}
            />
          </label>
          <div className="buttonRow">
            <button
              className="button buttonPrimary"
              disabled={loading}
              onClick={() => setActiveCommand(singleCommand.trim() || "Launch coordinated campaign")}
              type="button"
            >
              Generate plan
            </button>
          </div>
        </div>

        <div className="workspaceChecklist workspaceChecklistScrollable" style={{ marginTop: 16 }}>
          {nextAction ? (
            <div style={{ marginBottom: 10 }} className="muted">
              Next recommended action: <strong>{nextAction.item}</strong> · <strong>{nextAction.owner}</strong> · {nextAction.status}
            </div>
          ) : null}
          {commandPlan.length === 0 ? (
            <div className="workspaceEmptyState">
              <strong>No actions in this command plan.</strong>
            </div>
          ) : (
            commandPlan.map((action) => (
              <article className="workspaceChecklistItem" key={action.id}>
                <div className="workspaceChecklistHeader">
                  <div>
                    <strong>{action.item}</strong>
                    <p className="muted">
                      Owner: {action.owner} · Publish order: #{action.publishOrder}
                    </p>
                    <p className="muted">Amplification: {action.amplificationPriority}</p>
                    <p className="muted">Command: {action.command}</p>
                  </div>
                  <span className="pill">{action.status}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

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
          <label className="field">
            <span>Search tracked keywords</span>
            <input
              aria-label="Search tracked keywords"
              disabled={loading}
              onChange={(event) => updateSearchState("keywords", event.target.value)}
              placeholder="Filter keywords"
              value={search.keywords}
            />
          </label>
          <div className="workspaceChecklist workspaceChecklistScrollable">
            {dashboard.keywords.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No keywords tracked yet.</strong>
              </div>
            ) : filteredKeywords.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No keywords match that search.</strong>
              </div>
            ) : (
              filteredKeywords.map((keyword) => (
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
                Add one or more Reddit thread URLs to keep them visible in this dashboard list.
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
          <label className="field">
            <span>Search tracked threads</span>
            <input
              aria-label="Search tracked threads"
              disabled={loading}
              onChange={(event) => updateSearchState("threads", event.target.value)}
              placeholder="Filter threads by title or URL"
              value={search.threads}
            />
          </label>
          <div className="workspaceChecklist workspaceChecklistScrollable">
            {dashboard.threads.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No threads tracked yet.</strong>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="workspaceEmptyState">
                <strong>No threads match that search.</strong>
              </div>
            ) : (
              filteredThreads.map((thread) => (
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
                <span className="pill">
                  {filteredPostsToAnswer.length}/{dashboard.postsToAnswer.length}
                </span>
              </div>
              <label className="field">
                <span>Search active posts</span>
                <input
                  aria-label="Search active posts"
                  disabled={loading}
                  onChange={(event) => updateSearchState("postsToAnswer", event.target.value)}
                  placeholder="Filter by title, URL, subreddit, or author"
                  value={search.postsToAnswer}
                />
              </label>
              <div className="workspaceChecklist workspaceChecklistScrollable">
                {dashboard.postsToAnswer.length === 0 ? (
                  <div className="workspaceEmptyState">
                    <strong>No posts waiting for an answer.</strong>
                  </div>
                ) : filteredPostsToAnswer.length === 0 ? (
                  <div className="workspaceEmptyState">
                    <strong>No active posts match that search.</strong>
                  </div>
                ) : (
                  filteredPostsToAnswer.map((post) => (
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
                <span className="pill">
                  {filteredAnsweredPosts.length}/{dashboard.answeredPosts.length}
                </span>
              </div>
              <label className="field">
                <span>Search answered posts</span>
                <input
                  aria-label="Search answered posts"
                  disabled={loading}
                  onChange={(event) => updateSearchState("answeredPosts", event.target.value)}
                  placeholder="Filter by title, URL, subreddit, or author"
                  value={search.answeredPosts}
                />
              </label>
              <div className="workspaceChecklist workspaceChecklistScrollable">
                {dashboard.answeredPosts.length === 0 ? (
                  <div className="workspaceEmptyState">
                    <strong>No answered posts yet.</strong>
                  </div>
                ) : filteredAnsweredPosts.length === 0 ? (
                  <div className="workspaceEmptyState">
                    <strong>No answered posts match that search.</strong>
                  </div>
                ) : (
                  filteredAnsweredPosts.map((post) => (
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
