interface NotificationProps {
  message: string;
  remaining: number;
  onDismiss: () => void;
}

function Notification(props: NotificationProps) {
  return (
    <div className="notification">
      <p role="status">{props.message}</p>
      {props.remaining > 0 && <span className="notification-count">+{props.remaining} more</span>}
      <button type="button" onClick={props.onDismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

export default Notification;
