
// --- LAUNCH TIMESTAMP (UTC) ---
// This is the official launch timestamp in milliseconds since the epoch (UTC).
// The application will show the maintenance screen until this moment in time is reached,
// regardless of the user's local timezone.

// HOW TO SET FOR A SPECIFIC TIMEZONE (e.g., Pakistan Standard Time - PKT / UTC+5)
// 1. Go to a website like epochconverter.com.
// 2. Enter your desired launch date and time.
// 3. IMPORTANT: Set the timezone to your target timezone (e.g., "Asia/Karachi" for PKT).
// 4. Copy the resulting "Timestamp in milliseconds" and paste it below.

// Example: To launch at Jan 1, 2026, 12:00:00 PM (noon) in Pakistan (PKT),
// the correct UTC timestamp is 1767207600000.
export const LAUNCH_TIMESTAMP = 1753171030000;

// The Date object is created from the timestamp for use in the countdown component.
export const LAUNCH_DATE = new Date(LAUNCH_TIMESTAMP);
console.log(LAUNCH_DATE)
