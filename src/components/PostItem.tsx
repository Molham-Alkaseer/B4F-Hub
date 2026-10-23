import { useState } from "react";

interface PostItemProps {
  id: number;
  author: string;
  avatar: string;
  category: string;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  onLikePost: (id: number, liked: boolean) => Promise<void>;
  onDeletePost: (id: number) => Promise<void>;
  onError: (message: string) => void;
}

function PostItem(props: PostItemProps) {
  const [pendingAction, setPendingAction] = useState<"like" | "delete" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Posts: wait for the server before changing the card
  async function handleLikeClick() {
    if (pendingAction) return;
    setPendingAction("like");
    setErrorMessage("");
    try {
      await props.onLikePost(props.id, !props.liked);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Could not update this like. Please try again.";
      setErrorMessage(message);
      props.onError(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteClick() {
    if (pendingAction) return;
    setPendingAction("delete");
    setErrorMessage("");
    try {
      await props.onDeletePost(props.id);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Could not delete this post. Please try again.";
      setErrorMessage(message);
      props.onError(message);
    } finally {
      setPendingAction(null);
    }
  }

  const date = new Date(props.createdAt);
  const dateText = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li className="post-item">
      <div className="post-header">
        <span className="post-avatar">{props.avatar}</span>
        <div className="post-author">
          <h3>{props.author}</h3>
          <time dateTime={props.createdAt} title={date.toLocaleString()}>
            {dateText}
          </time>
        </div>
        <span className={"post-category " + props.category}>{props.category}</span>
      </div>

      <p className="post-content">{props.content}</p>

      <div className="post-actions">
        <button
          type="button"
          className={"post-like" + (props.liked ? " liked" : "")}
          onClick={handleLikeClick}
          disabled={pendingAction !== null}
          aria-pressed={props.liked}
        >
          <span aria-hidden="true">{props.liked ? "♥" : "♡"}</span>
          {pendingAction === "like" ? "Saving..." : props.liked ? "Liked" : "Like"}
        </button>
        <span className="post-like-count">
          {props.likes} {props.likes === 1 ? "like" : "likes"}
        </span>
        <button
          type="button"
          className="delete-button"
          onClick={handleDeleteClick}
          disabled={pendingAction !== null}
        >
          {pendingAction === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
    </li>
  );
}

export default PostItem;
