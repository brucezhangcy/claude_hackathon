import coursesData from './courses.json';
import tracksData from './tracks.json';

export interface Course {
  id: string;
  name: string;
  prerequisites: string[];
}

export interface Track {
  id: string;
  name: string;
  requiredCourses: string[];
}

export const courses: Course[] = coursesData.courses;
export const tracks: Track[] = tracksData.tracks;

// Helper to get course by ID
export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

// Helper to get all course IDs
export const getAllCourseIds = (): string[] => {
  return courses.map(course => course.id);
};

// Helper to build adjacency map (course -> courses that require it)
export const buildDependentsMap = (): Map<string, string[]> => {
  const dependents = new Map<string, string[]>();

  // Initialize all courses with empty arrays
  courses.forEach(course => {
    dependents.set(course.id, []);
  });

  // Build reverse dependency graph
  courses.forEach(course => {
    course.prerequisites.forEach(prereq => {
      const deps = dependents.get(prereq) || [];
      deps.push(course.id);
      dependents.set(prereq, deps);
    });
  });

  return dependents;
};
