import { useContext } from "react";
import NotificationContext from "../NotificationContext";

const useNotify = () => {
  const { notification, setNotification } = useContext(NotificationContext)  // (1)

  const notify = (message) => {                                 // (2)
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  return {notify, notification}                                                  // (3)
}

export default useNotify
