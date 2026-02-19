import { useEffect, useState } from "react";
import { uiSyncBridge, type Notification } from "../services/state-bridge";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>(
    uiSyncBridge.getLastState()?.notifications || [],
  );

  useEffect(() => {
    // Subscribe to updates
    return uiSyncBridge.subscribe((state) => {
      if (state.notifications) {
        setNotifications(state.notifications);
      }
    });
  }, []);

  const clearNotifications = () => {
    const currentState = uiSyncBridge.getLastState();
    if (currentState) {
      uiSyncBridge.publish({
        ...currentState,
        notifications: [],
        lastUpdate: Date.now(),
      });
    }
  };

  return (
    <div className="react-island-container wics-card">
      <div className="wics-header flex items-center justify-between">
        <span>Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600">
            Clear All
          </button>
        )}
      </div>
      <div className="space-y-2 p-4">
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-gray-500 italic">No notifications</div>
        ) : (
          notifications
            .map((n) => (
              <div
                key={n.id}
                className={`rounded-md border-l-4 p-3 shadow-sm ${
                  n.type === "error"
                    ? "border-red-500 bg-red-50 text-red-800"
                    : n.type === "warning"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-800"
                      : n.type === "success"
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-blue-500 bg-blue-50 text-blue-800"
                }`}>
                <div className="mb-1 text-sm font-semibold capitalize">{n.type}</div>
                <div className="text-sm">{n.message}</div>
                <div className="mt-2 text-[10px] text-gray-400">
                  {new Date(n.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
            .reverse()
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
