import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { data } = trpc.ws.listNotifications.useQuery({ unreadOnly: true });

  useEffect(() => {
    if (data?.items) {
      setNotifications(data.items);
    }
  }, [data]);

  return { notifications, unreadCount: data?.unreadCount || 0 };
}

export function useOnlineUsers() {
  const { data: onlineUsers } = trpc.ws.getOnlineUsers.useQuery(undefined, {
    refetchInterval: 15000,
  });
  return onlineUsers || [];
}

export function usePresence() {
  const { data: presence } = trpc.ws.getPresence.useQuery(undefined, {
    refetchInterval: 10000,
  });
  return presence || [];
}
