import { Alert } from "../../providers/NotificationProvider";
import { Button } from "../Button";

interface Props {
  alert: Alert;
}

const AlertComp = ({ alert }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="bg-white h-48 w-96 rounded-2xl flex flex-col justify-center items-center">
        <p className="px-4">{alert.msg}</p>
        <div className="flex flex-row justify-around w-full mt-6">
          <Button onClick={alert.onCancel}>Cancel</Button>
          <Button onClick={alert.onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};

export default AlertComp;
