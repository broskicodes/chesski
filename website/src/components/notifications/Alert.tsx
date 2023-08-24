import { Alert } from "../../providers/NotificationProvider";
import { Button } from "../Button";

interface Props {
  alert: Alert;
}

const AlertComp = ({ alert }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div
        className={`bg-white ${alert.title ? "h-64" : "h-48"} w-96 rounded-2xl flex flex-col justify-center items-center relative`}
      >
        {alert.title ? (
          <div className="w-full text-center absolute top-2">
            <p className="text-2xl font-bold">{alert.title}</p>
            <hr />
          </div>
        ) : null}
        <div className={`px-4 absolute ${alert.title ? "top-16" : "top-8"}`}>
          {alert.msg}
        </div>
        <div className="flex flex-row justify-around w-full mt-6 absolute bottom-6">
          {alert.type === "confirm" ? (
            <span className="flex flex-row justify-around w-full">
              <Button onClick={alert.onConfirm}>Yes</Button>
              <Button onClick={alert.onCancel}>No</Button>
            </span>
          ) : (
            <Button onClick={alert.onConfirm}>Ok</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertComp;
