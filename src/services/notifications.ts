import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function prepareNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("task-reminders", {
        name: "Task reminders",
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#746BFF"
      });
    }

    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();

    return requested.granted;
  } catch (error) {
    console.warn(
      "TaskFlow notifications are unavailable in this runtime:",
      error
    );

    return false;
  }
}

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDate: string | null
): Promise<void> {
  try {
    await Notifications
      .cancelScheduledNotificationAsync(taskId)
      .catch(() => undefined);

    if (!dueDate) {
      return;
    }

    const parsed = new Date(`${dueDate}T09:00:00`);

    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getTime() <= Date.now()
    ) {
      return;
    }

    const allowed = await prepareNotifications();

    if (!allowed) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: taskId,
      content: {
        title: "TaskFlow reminder",
        body: title,
        data: { taskId }
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: parsed,
        channelId: "task-reminders"
      } as Notifications.DateTriggerInput
    });
  } catch (error) {
    console.warn("Could not schedule TaskFlow reminder:", error);
  }
}
