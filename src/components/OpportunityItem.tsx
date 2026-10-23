import { useState } from "react";
import type { Opportunity } from "../App";

interface OpportunityItemProps {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  type: string;
  workMode: string;
  location: string;
  skills: string[];
  applied: boolean;
  onApply: (id: number) => Promise<void>;
  onError: (message: string) => void;
  details: Opportunity | undefined;
  onToggleDetails: (id: number) => void;
  saved: boolean;
  onToggleSaved: (id: number) => void;
}

function OpportunityItem(props: OpportunityItemProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Opportunities: prevent a second application while waiting
  async function handleApplyClick() {
    if (props.applied || isApplying) return;
    setIsApplying(true);
    setErrorMessage("");
    try {
      await props.onApply(props.id);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Could not apply. Please try again.";
      setErrorMessage(message);
      props.onError(message);
    } finally {
      setIsApplying(false);
    }
  }

  function handleDetailsClick() {
    props.onToggleDetails(props.id);
  }

  function handleSaveClick() {
    props.onToggleSaved(props.id);
  }

  return (
    <li className="opportunity-item">
      <div className="opportunity-header">
        <span className="company-logo">{props.companyLogo}</span>
        <div className="opportunity-company">
          <h3>{props.title}</h3>
          <p>{props.company}</p>
        </div>
        <button
          type="button"
          className={"save-button" + (props.saved ? " saved" : "")}
          aria-label={(props.saved ? "Unsave " : "Save ") + props.title}
          aria-pressed={props.saved}
          onClick={handleSaveClick}
        >
          <span aria-hidden="true">{props.saved ? "★" : "☆"}</span>
        </button>
      </div>

      <div className="opportunity-meta">
        <span className="opportunity-type">{props.type}</span>
        <span className="opportunity-work-mode">{props.workMode}</span>
        <span>{props.location}</span>
      </div>

      <ul className="opportunity-skills" >
        {props.skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      {props.details && (
        <div className="opportunity-details" id={"opportunity-details-" + props.id}>
          <p>{props.details.description}</p>
          <dl>
            <div>
              <dt>Apply by</dt>
              <dd><time dateTime={props.details.deadline}>{props.details.deadline}</time></dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd className="opportunity-level">{props.details.level}</dd>
            </div>
            <div>
              <dt>Posted</dt>
              <dd><time dateTime={props.details.postedAt}>{props.details.postedAt}</time></dd>
            </div>
          </dl>
        </div>
      )}

      <div className="opportunity-actions">
        <button
          type="button"
          className="details-button"
          onClick={handleDetailsClick}
          aria-expanded={props.details !== undefined}
          aria-controls={props.details ? "opportunity-details-" + props.id : undefined}
        >
          {props.details ? "Hide details" : "View details"}
        </button>
        <button
          type="button"
          className={"apply-button" + (props.applied ? " applied" : "")}
          onClick={handleApplyClick}
          disabled={props.applied || isApplying}
        >
          {props.applied ? "Applied" : isApplying ? "Applying..." : "Apply"}
        </button>
      </div>
      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
    </li>
  );
}

export default OpportunityItem;
