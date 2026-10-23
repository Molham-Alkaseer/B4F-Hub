import { useState } from "react";
import useLoadData from "./hooks/useLoadData";
import type { ChangeEvent } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PostItem from "./components/PostItem";
import OpportunityItem from "./components/OpportunityItem";
import AddPost from "./components/AddPost";
import Notification from "./components/Notification";

// Post categories
export type PostCategory = "announcement" | "event" | "community" | "resource";

type PostCategoryFilter = "all" | PostCategory;
// Opportunity categories and work modes
type OpportunityType = "job" | "internship" | "scholarship" | "volunteer";
type WorkMode = "remote" | "hybrid" | "on-site";
type OpportunityTypeFilter = "all" | OpportunityType;
type WorkModeFilter = "all" | WorkMode;

// Post data
export interface Post {
  id: number;
  author: string;
  avatar: string;
  category: PostCategory;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
}

// Opportunity data
export interface Opportunity {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  type: OpportunityType;
  workMode: WorkMode;
  location: string;
  skills: string[];
  description: string;
  deadline: string;
  postedAt: string;
  level: "entry" | "junior" | "mid" | "any";
  applied: boolean;
}

const POSTS_URL = "/api/posts";
const OPPORTUNITIES_URL = "/api/opportunities";

// Shared: keep the server's validation message
async function checkResponse(response: Response) {
  if (response.ok) return;

  let message = `Request failed (${response.status}). Please try again.`;
  try {
    const result = (await response.json()) as { error?: string };
    if (typeof result.error === "string") {
      message = result.error;
    }
  } catch {
    message = "The server could not complete the request. Please try again.";
  }
  throw new Error(message);
}

function App() {
  // Post filters
  const [currentCategory, setCurrentCategory] =
    useState<PostCategoryFilter>("all");
  const [postSearchText, setPostSearchText] = useState("");
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  // Opportunity filters
  const [opportunitySearchText, setOpportunitySearchText] = useState("");
  const [currentType, setCurrentType] = useState<OpportunityTypeFilter>("all");
  const [currentWorkMode, setCurrentWorkMode] = useState<WorkModeFilter>("all");
  // Posts: records, loading, and retry
  const {
    data: posts,
    setData: setPosts,
    isLoading: isLoadingPosts,
    hasError: hasPostError,
    retry: loadPostData,
  } = useLoadData<Post>(POSTS_URL);

  // Opportunities: records, loading, and retry
  const {
    data: opportunities,
    setData: setOpportunities,
    isLoading: isLoadingOpportunities,
    hasError: hasOpportunityError,
    retry: loadOpportunityData,
  } = useLoadData<Opportunity>(OPPORTUNITIES_URL);

  // Opportunities: details, history, and saved IDs
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<
    number | null
  >(null);
  const [opportunityHistory, setOpportunityHistory] = useState<number[]>([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<{
    [id: number]: boolean;
  }>({});
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  // Shared notification queue
  const [notifications, setNotifications] = useState<string[]>([]);

  // Posts: category, search, and liked-only controls
  function handleShowAllPosts() {
    setCurrentCategory("all");
  }

  function handleShowAnnouncements() {
    setCurrentCategory("announcement");
  }

  function handleShowEvents() {
    setCurrentCategory("event");
  }

  function handleShowCommunity() {
    setCurrentCategory("community");
  }

  function handleShowResources() {
    setCurrentCategory("resource");
  }

  function handlePostSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setPostSearchText(event.target.value);
  }

  function handleLikedOnlyChange(event: ChangeEvent<HTMLInputElement>) {
    setShowLikedOnly(event.target.checked);
  }

  // Opportunities: search, type, and work-mode controls
  function handleOpportunitySearchChange(event: ChangeEvent<HTMLInputElement>) {
    setOpportunitySearchText(event.target.value);
  }

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    setCurrentType(event.target.value as OpportunityTypeFilter);
  }

  function handleWorkModeChange(event: ChangeEvent<HTMLSelectElement>) {
    setCurrentWorkMode(event.target.value as WorkModeFilter);
  }

  // Posts: apply the selected filters
  const postSearch = postSearchText.trim().toLowerCase();

  const visiblePosts = posts.filter((post) => {
    const matchesCategory =
      currentCategory === "all" || post.category === currentCategory;
    const author = post.author.toLowerCase();
    const content = post.content.toLowerCase();
    const matchesSearch =
      author.includes(postSearch) || content.includes(postSearch);
    const matchesLiked = !showLikedOnly || post.liked;

    return matchesCategory && matchesSearch && matchesLiked;
  });

  // Opportunities: ID lookup and detail history
  const opportunitiesById: { [id: number]: Opportunity | undefined } = {};

  for (const opportunity of opportunities) {
    opportunitiesById[opportunity.id] = opportunity;
  }

  const selectedOpportunity =
    selectedOpportunityId === null
      ? undefined
      : opportunitiesById[selectedOpportunityId];
  const previousOpportunityId =
    opportunityHistory[opportunityHistory.length - 1];
  const previousOpportunity = opportunitiesById[previousOpportunityId];

  function handleToggleDetails(id: number) {
    if (selectedOpportunityId === id) {
      setSelectedOpportunityId(null);
      return;
    }

    if (selectedOpportunityId !== null) {
      const history = [...opportunityHistory];
      history.push(selectedOpportunityId);
      setOpportunityHistory(history);
    }

    setSelectedOpportunityId(id);
  }

  function handlePreviousOpportunity() {
    const history = [...opportunityHistory];
    const previousId = history.pop();

    if (previousId === undefined) {
      return;
    }

    setOpportunityHistory(history);
    setSelectedOpportunityId(previousId);
    setOpportunitySearchText("");
    setCurrentType("all");
    setCurrentWorkMode("all");
    setShowSavedOnly(false);
  }

  // Opportunities: save and unsave
  function handleToggleSaved(id: number) {
    setSavedOpportunityIds((currentIds) => {
      const savedIds = { ...currentIds };

      if (savedIds[id]) {
        delete savedIds[id];
      } else {
        savedIds[id] = true;
      }

      return savedIds;
    });
  }

  function handleSavedOnlyChange(event: ChangeEvent<HTMLInputElement>) {
    setShowSavedOnly(event.target.checked);
  }

  // Opportunities: apply the selected filters
  const opportunitySearch = opportunitySearchText.trim().toLowerCase();

  const visibleOpportunities = opportunities.filter((opportunity) => {
    const matchesType =
      currentType === "all" || opportunity.type === currentType;
    const matchesWorkMode =
      currentWorkMode === "all" || opportunity.workMode === currentWorkMode;
    const title = opportunity.title.toLowerCase();
    const company = opportunity.company.toLowerCase();
    let matchesSkill = false;

    for (const skill of opportunity.skills) {
      if (skill.toLowerCase().includes(opportunitySearch)) {
        matchesSkill = true;
        break;
      }
    }

    const matchesSearch =
      title.includes(opportunitySearch) ||
      company.includes(opportunitySearch) ||
      matchesSkill;

    const matchesSaved = !showSavedOnly || savedOpportunityIds[opportunity.id];

    return matchesType && matchesWorkMode && matchesSearch && matchesSaved;
  });

  // Shared: add and dismiss notifications
  function addNotification(message: string) {
    setNotifications((currentNotifications) => {
      const queue = [...currentNotifications];
      queue.push(message);
      return queue;
      // or we could do return [...currentNotifications, message] instaede
    });
  }

  function handleDismissNotification() {
    setNotifications((currentNotifications) => {
      const queue = [...currentNotifications];
      queue.shift();
      return queue;
    });
  }
  // we could do currentNotifications.slice(1) rathe than mutating the array

  // Posts: create, like, and delete
  async function handleAddPost(content: string, category: PostCategory) {
    const response = await fetch(POSTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    });
    await checkResponse(response);
    const post = (await response.json()) as Post;
    setPosts((currentPosts) => [post, ...currentPosts]);
    setCurrentCategory("all");
    setPostSearchText("");
    setShowLikedOnly(false);
    addNotification("Your post was published.");
  }

  async function handleLikePost(id: number, liked: boolean) {
    const response = await fetch(POSTS_URL + "/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked }),
    });
    await checkResponse(response);
    const updatedPost = (await response.json()) as Post;
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        return post.id === id ? updatedPost : post;
      }),
    );
    addNotification(liked ? "Post liked." : "Like removed.");
  }

  async function handleDeletePost(id: number) {
    const response = await fetch(POSTS_URL + "/" + id, { method: "DELETE" });
    await checkResponse(response);
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
    addNotification("Post deleted.");
  }

  // Opportunities: apply once, then use the server's updated record
  async function handleApply(id: number) {
    const opportunity = opportunitiesById[id];
    if (!opportunity || opportunity.applied) return;

    const response = await fetch(OPPORTUNITIES_URL + "/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applied: true }),
    });
    await checkResponse(response);
    const updatedOpportunity = (await response.json()) as Opportunity;
    setOpportunities((currentOpportunities) =>
      currentOpportunities.map((item) => {
        return item.id === id ? updatedOpportunity : item;
      }),
    );
    addNotification("You applied to " + updatedOpportunity.title + ".");
  }

  return (
    <div className="app">
      {/* Shared header */}
      <Header />

      <main className="container">
        {/* Posts: controls, composer, and feed */}
        <section className="panel" aria-labelledby="community-title">
          <div className="panel-header">
            <h2 id="community-title">Community</h2>
          </div>

          <div className="panel-content">
            {/* Posts: compose form */}
            <AddPost
              disabled={isLoadingPosts || hasPostError}
              onAddPost={handleAddPost}
              onError={addNotification}
            />

            {/* Posts: category buttons */}
            <div className="filters" role="group" aria-label="Post categories">
              <button
                type="button"
                className={
                  "filter-button" + (currentCategory === "all" ? " active" : "")
                }
                onClick={handleShowAllPosts}
                aria-pressed={currentCategory === "all"}
              >
                All
              </button>
              <button
                type="button"
                className={
                  "filter-button" +
                  (currentCategory === "announcement" ? " active" : "")
                }
                onClick={handleShowAnnouncements}
                aria-pressed={currentCategory === "announcement"}
              >
                Announcements
              </button>
              <button
                type="button"
                className={
                  "filter-button" +
                  (currentCategory === "event" ? " active" : "")
                }
                onClick={handleShowEvents}
                aria-pressed={currentCategory === "event"}
              >
                Events
              </button>
              <button
                type="button"
                className={
                  "filter-button" +
                  (currentCategory === "community" ? " active" : "")
                }
                onClick={handleShowCommunity}
                aria-pressed={currentCategory === "community"}
              >
                Community
              </button>
              <button
                type="button"
                className={
                  "filter-button" +
                  (currentCategory === "resource" ? " active" : "")
                }
                onClick={handleShowResources}
                aria-pressed={currentCategory === "resource"}
              >
                Resources
              </button>
            </div>

            {/* Posts: search and liked-only filter */}
            <div className="search">
              <input
                type="search"
                className="search-input"
                placeholder="Search author or content..."
                aria-label="Search posts"
                value={postSearchText}
                onChange={handlePostSearchChange}
              />
            </div>
            <label className="liked-only-filter">
              <input
                type="checkbox"
                checked={showLikedOnly}
                onChange={handleLikedOnlyChange}
              />
              Liked only
            </label>
            {/* Posts : loading message*/}
            {isLoadingPosts && (
              <p className="message" role="status">
                Loading the community feed...
              </p>
            )}

            {/* Posts: error and retry*/}
            {!isLoadingPosts && hasPostError && (
              <div className="message error" role="alert">
                <p>We could not load the community feed. Please try again.</p>
                <button
                  type="button"
                  className="retry-button"
                  onClick={loadPostData}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Posts: result count, cards, or empty message*/}
            {!isLoadingPosts && !hasPostError && (
              <div>
                <p className="visible-count" role="status">
                  {visiblePosts.length} of {posts.length} posts shown
                </p>
                {visiblePosts.length > 0 ? (
                  <ul className="post-list">
                    {visiblePosts.map((post) => (
                      <PostItem
                        key={post.id}
                        id={post.id}
                        author={post.author}
                        avatar={post.avatar}
                        category={post.category}
                        content={post.content}
                        createdAt={post.createdAt}
                        likes={post.likes}
                        liked={post.liked}
                        onLikePost={handleLikePost}
                        onDeletePost={handleDeletePost}
                        onError={addNotification}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">
                    {posts.length === 0
                      ? "No posts yet."
                      : "No posts match your filters right now."}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Opportunities : controls and cards*/}
        <section className="panel" aria-labelledby="opportunities-title">
          <div className="panel-header">
            <h2 id="opportunities-title">Opportunities</h2>

            {/* Opportunities: search */}
            <div className="search">
              <input
                type="search"
                className="search-input"
                placeholder="Search title, company, or skill..."
                aria-label="Search opportunities"
                value={opportunitySearchText}
                onChange={handleOpportunitySearchChange}
              />
            </div>

            {/* Opportunities  : type, work mode, and saved-only filters*/}
            <div className="opportunity-filters">
              <select
                className="filter-select"
                value={currentType}
                aria-label="Opportunity type"
                onChange={handleTypeChange}
              >
                <option value="all">All types</option>
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="volunteer">Volunteer</option>
              </select>

              <select
                className="filter-select"
                value={currentWorkMode}
                aria-label="Work mode"
                onChange={handleWorkModeChange}
              >
                <option value="all">All work modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
              <label className="saved-only-filter">
                <input
                  type="checkbox"
                  checked={showSavedOnly}
                  onChange={handleSavedOnlyChange}
                />
                Saved only
              </label>
            </div>
          </div>

          <div className="panel-content">
            {/* Opportunities : loading message*/}
            {isLoadingOpportunities && (
              <p className="message" role="status">
                Loading opportunities...
              </p>
            )}

            {/* Opportunities: error and retry*/}
            {!isLoadingOpportunities && hasOpportunityError && (
              <div className="message error" role="alert">
                <p>We could not load opportunities. Please try again.</p>
                <button
                  type="button"
                  className="retry-button"
                  onClick={loadOpportunityData}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Opportunities : results*/}
            {!isLoadingOpportunities && !hasOpportunityError && (
              <div>
                {/* Opportunities: result count */}
                <p className="visible-count" role="status">
                  {visibleOpportunities.length} of {opportunities.length}{" "}
                  opportunities shown
                </p>
                {/* Opportunities : back through detail history*/}
                {previousOpportunity && (
                  <button
                    type="button"
                    className="history-button"
                    onClick={handlePreviousOpportunity}
                  >
                    Back to {previousOpportunity.title}
                  </button>
                )}
                {/* Opportunities: cards or empty message */}
                {visibleOpportunities.length > 0 ? (
                  <ul className="opportunity-list">
                    {visibleOpportunities.map((opportunity) => (
                      <OpportunityItem
                        key={opportunity.id}
                        id={opportunity.id}
                        title={opportunity.title}
                        company={opportunity.company}
                        companyLogo={opportunity.companyLogo}
                        type={opportunity.type}
                        workMode={opportunity.workMode}
                        location={opportunity.location}
                        skills={opportunity.skills}
                        applied={opportunity.applied}
                        onApply={handleApply}
                        onError={addNotification}
                        details={
                          selectedOpportunity != null &&
                          selectedOpportunity.id === opportunity.id
                            ? selectedOpportunity
                            : undefined
                        }
                        onToggleDetails={handleToggleDetails}
                        saved={savedOpportunityIds[opportunity.id] === true}
                        onToggleSaved={handleToggleSaved}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">
                    {opportunities.length === 0
                      ? "No opportunities yet."
                      : "No opportunities match your filters right now."}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Shared footer*/}
      <Footer />
      {/* Shared: current notification and dismiss button*/}
      {notifications.length > 0 && (
        <Notification
          message={notifications[0]}
          remaining={notifications.length - 1}
          onDismiss={handleDismissNotification}
        />
      )}
    </div>
  );
}

export default App;
