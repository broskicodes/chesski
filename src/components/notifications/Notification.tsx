import { Notification } from "../../providers/NotificationProvider";
import CheckThinIcon from "../icons/CheckThinIcon";
import InfoThinIcon from "../icons/InfoThinIcon";
import WarningThinIcon from "../icons/WarningThinIcon";
import XThinIcon from "../icons/XThinIcon";

type Props = {
  notification: Notification;
};

const NotificationComp = ({ notification }: Props) => {
  if (!notification?.type) {
    return null;
  }

  const iconMap = {
    info: {
      component: InfoThinIcon,
      props: {
        color: "#1e3a8a",
      },
    },
    error: {
      component: XThinIcon,
      props: {
        color: "#A21111",
      },
    },
    success: {
      component: CheckThinIcon,
      props: {
        color: "#14532D",
      },
    },
    warning: {
      component: WarningThinIcon,
      props: {
        color: "#D8CA33",
      },
    },
  };

  const IconComponent = iconMap[notification.type].component;

  return (
    <div
      className="animate-fadeInUp"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={`alert alert-${notification.type} text-sm mb-3 peer-last:mb-0`}
      >
        <div>
          <IconComponent {...iconMap[notification.type].props} />
          <span className="pl-1">{notification.msg}</span>
        </div>
      </div>
    </div>
    // <p>piss</p>
  );
};

export default NotificationComp;
