import { courses } from '../data';

/**
 * Find all courses that are affected by excluding certain courses.
 * Uses BFS to traverse the dependency graph downstream.
 */
export function findAffectedCourses(excludedCourses: Set<string>): Set<string> {
  const affected = new Set<string>();

  // Build reverse adjacency list (course -> courses that depend on it)
  const dependents = new Map<string, string[]>();

  courses.forEach(course => {
    dependents.set(course.id, []);
  });

  courses.forEach(course => {
    course.prerequisites.forEach(prereq => {
      const deps = dependents.get(prereq) || [];
      deps.push(course.id);
      dependents.set(prereq, deps);
    });
  });

  // BFS from each excluded course
  for (const excluded of excludedCourses) {
    const queue = [excluded];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current)) continue;
      visited.add(current);

      for (const dependent of dependents.get(current) || []) {
        if (!affected.has(dependent) && !excludedCourses.has(dependent)) {
          affected.add(dependent);
          queue.push(dependent);
        }
      }
    }
  }

  return affected;
}

/**
 * Check if a course is available (not excluded or affected)
 */
export function isCourseAvailable(
  courseId: string,
  excludedCourses: Set<string>,
  affectedCourses: Set<string>
): boolean {
  return !excludedCourses.has(courseId) && !affectedCourses.has(courseId);
}
