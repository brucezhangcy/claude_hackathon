import { useState, useCallback, useMemo } from 'react';
import CourseGraph from './components/CourseGraph';
import TrackStatus from './components/TrackStatus';
import { findAffectedCourses } from './utils/graphAlgorithms';

import './App.css';

function App() {
  const [excludedCourses, setExcludedCourses] = useState<Set<string>>(() => new Set());
  // New state: courses the user has taken (clicked)
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(() => new Set());

  // Calculate affected courses as derived state (memoized)
  const affectedCourses = useMemo(() => {
    return findAffectedCourses(excludedCourses);
  }, [excludedCourses]);

  // Handle course click - cycle through: not taken -> taken -> don't want to take -> not taken
  const handleCourseClick = useCallback((courseId: string) => {
    console.log('App received click:', courseId);
    const isCompleted = completedCourses.has(courseId);
    const isExcluded = excludedCourses.has(courseId);

    if (!isCompleted && !isExcluded) {
      // First click: mark as taken
      const newCompleted = new Set(completedCourses);
      newCompleted.add(courseId);
      setCompletedCourses(newCompleted);
    } else if (isCompleted) {
      // Second click: move to don't want to take (excluded)
      const newCompleted = new Set(completedCourses);
      newCompleted.delete(courseId);
      setCompletedCourses(newCompleted);

      const newExcluded = new Set(excludedCourses);
      newExcluded.add(courseId);
      setExcludedCourses(newExcluded);
    } else if (isExcluded) {
      // Third click: reset to not taken (default)
      const newExcluded = new Set(excludedCourses);
      newExcluded.delete(courseId);
      setExcludedCourses(newExcluded);
    }
  }, [completedCourses, excludedCourses]);

  // Reset all selections (taken and excluded courses)
  const handleReset = useCallback(() => {
    setCompletedCourses(new Set());
    setExcludedCourses(new Set());
  }, []);


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>USC CS Course Impact Visualizer</h1>
          <div className="header-actions">
            {(completedCourses.size > 0 || excludedCourses.size > 0) && (
              <button onClick={handleReset} className="reset-button">
                Reset All
              </button>
            )}
          </div>
        </div>
        <p className="header-subtitle">
          Default: "I haven't taken any courses yet". Click a course: 1st click = Taken (green), 2nd = Don't Want to Take (red), 3rd = Reset (gray).
        </p>
      </header>

      <main className="app-main">
        <div className="graph-container">
          <CourseGraph
            excludedCourses={excludedCourses}
            affectedCourses={affectedCourses}
            onCourseClick={handleCourseClick}
            completedCourses={completedCourses}
          />
        </div>
        <div className="sidebar">
          <TrackStatus
            excludedCourses={excludedCourses}
            affectedCourses={affectedCourses}
            completedCourses={completedCourses}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color normal"></span>
            <span>Taken</span>
          </div>
          <div className="legend-item">
            <span className="legend-color excluded"></span>
            <span>Not Taken</span>
          </div>
          <div className="legend-item">
            <span className="legend-color affected"></span>
            <span>Don't Want to Take</span>
          </div>
          <div className="legend-item">
            <span className="legend-color available-next"></span>
            <span>Available Next</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
