/**
 * Manages persistent anonymous student identity for the Coding Lab.
 * Ensures every student's code drafts, submissions, streaks, and progress
 * are seamlessly persisted in MongoDB across sessions without forced logins.
 */

const STORAGE_KEY = 'sankalp_student_id';

export function getStudentId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || id.trim().length === 0) {
      // Generate a clean, collision-resistant identifier
      const randomPart = Math.random().toString(36).substring(2, 10);
      const timestampPart = Date.now().toString(36);
      id = `student_${randomPart}${timestampPart}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch (err) {
    return 'student_anonymous_guest';
  }
}
