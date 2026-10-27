import * as Notifications from "expo-notifications";

/**
 * Set the badge count on the app icon
 * @param count - Number to display on badge (0 to hide)
 */
export async function updateNotificationBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
  }
}

/**
 * Clear the badge (set to 0)
 */
export async function clearNotificationBadge(): Promise<void> {
  await updateNotificationBadgeCount(0);
}

/**
 * Get current badge count
 */
export async function getNotificationBadgeCount(): Promise<number> {
  try {
    const count = await Notifications.getBadgeCountAsync();
    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * Increment badge count by a specific amount
 */
export async function incrementBadgeCount(increment = 1): Promise<number> {
  try {
    const currentCount = await getNotificationBadgeCount();
    const newCount = currentCount + increment;
    await updateNotificationBadgeCount(newCount);
    return newCount;
  } catch (error) {
    return 0;
  }
}

/**
 * Decrement badge count by a specific amount
 */
export async function decrementBadgeCount(decrement = 1): Promise<number> {
  try {
    const currentCount = await getNotificationBadgeCount();
    const newCount = Math.max(0, currentCount - decrement);
    await updateNotificationBadgeCount(newCount);
    return newCount;
  } catch (error) {
    return 0;
  }
}
