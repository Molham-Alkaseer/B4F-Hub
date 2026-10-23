import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { PostCategory } from "../App";

const MIN_CONTENT_LENGTH = 3;
const MAX_CONTENT_LENGTH = 2000;

interface AddPostProps {
  disabled: boolean;
  onAddPost: (content: string, category: PostCategory) => Promise<void>;
  onError: (message: string) => void;
}

function AddPost(props: AddPostProps) {
  const [draftContent, setDraftContent] = useState("");
  const [draftCategory, setDraftCategory] = useState<PostCategory>("community");
  const [formError, setFormError] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDraftContent(event.target.value);
    setFormError("");
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setDraftCategory(event.target.value as PostCategory);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (props.disabled || isPosting) {
      return;
    }

    const trimmedContent = draftContent.trim();

    if (trimmedContent.length < MIN_CONTENT_LENGTH) {
      setFormError(`Write at least ${MIN_CONTENT_LENGTH} characters.`);
      return;
    }

    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      setFormError(`Keep your post to ${MAX_CONTENT_LENGTH} characters or fewer.`);
      return;
    }

    if (
      draftCategory !== "announcement" &&
      draftCategory !== "event" &&
      draftCategory !== "community" &&
      draftCategory !== "resource"
    ) {
      setFormError("Choose a post category.");
      return;
    }

    setFormError("");
    setIsPosting(true);
    try {
      await props.onAddPost(trimmedContent, draftCategory);
      setDraftContent("");
      setDraftCategory("community");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Could not publish your post. Please try again.";
      setFormError(message);
      props.onError(message);
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <form className="add-post-form" onSubmit={handleSubmit}>
      <label htmlFor="post-content">Share with the community</label>
      <textarea
        id="post-content"
        className="add-post-input"
        placeholder="What's on your mind?"
        rows={3}
        value={draftContent}
        disabled={isPosting}
        aria-invalid={formError !== ""}
        aria-describedby={formError ? "post-error" : undefined}
        onChange={handleContentChange}
      />
      <div className="add-post-controls">
        <select
          className="filter-select"
          aria-label="Post category"
          value={draftCategory}
          disabled={isPosting}
          onChange={handleCategoryChange}
        >
          <option value="announcement">Announcement</option>
          <option value="event">Event</option>
          <option value="community">Community</option>
          <option value="resource">Resource</option>
        </select>
        <span className="post-character-count">
          {draftContent.trim().length} / {MAX_CONTENT_LENGTH}
        </span>
        <button className="add-post-button" type="submit" disabled={props.disabled || isPosting}>
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
      {formError && <p id="post-error" className="form-error" role="alert">{formError}</p>}
    </form>
  );
}

export default AddPost;
