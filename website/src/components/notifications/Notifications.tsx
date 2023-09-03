import { animated, Transition } from "react-spring";
import { useNotifications } from "../../providers/NotificationProvider";
import Notification from "./Notification";
import Alert from "./Alert";

export const Notifications = () => {
  const { notifications, alert } = useNotifications();

  return (
    <div>
      {notifications.length ? (
        <div className="fixed z-50 right-6 bottom-6 flex flex-col justify-center">
          <Transition
            items={notifications}
            from={{ opacity: 0 }}
            enter={{ opacity: 1 }}
            leave={{ opacity: 0 }}
          >
            {(styles, notification) =>
              notification && (
                <animated.div style={styles}>
                  <Notification notification={notification} />
                </animated.div>
              )
            }
          </Transition>
        </div>
      ) : null}
      {alert ? (
        <div className="fixed z-50 inset-0">
          <Alert alert={alert} />
        </div>
      ) : null}
    </div>
  );
};
