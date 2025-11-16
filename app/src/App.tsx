import { useState, useCallback, useMemo } from 'react';
import CourseGraph from './components/CourseGraph';
import TrackStatus from './components/TrackStatus';
import { findAffectedCourses } from './utils/graphAlgorithms';
import './App.css';

function App() {
  const [excludedCourses, setExcludedCourses] = useState<Set<string>>(() => new Set());

  // Calculate affected courses as derived state (memoized)
  const affectedCourses = useMemo(() => {
    return findAffectedCourses(excludedCourses);
  }, [excludedCourses]);

  // Handle course click - toggle excluded status
  const handleCourseClick = useCallback((courseId: string) => {
    console.log('App received click:', courseId);
    setExcludedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  // Reset all selections
  const handleReset = useCallback(() => {
    setExcludedCourses(new Set());
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>USC CS Course Impact Visualizer</h1>
          <div className="header-actions">
            {excludedCourses.size > 0 && (
              <button onClick={handleReset} className="reset-button">
                Reset All
              </button>
            )}
          </div>
        </div>
        <p className="header-subtitle">
          Click on a course to mark it as "not taking" and see the impact on downstream courses
        </p>
      </header>

      <main className="app-main">
        <div className="graph-container">
          <CourseGraph
            excludedCourses={excludedCourses}
            affectedCourses={affectedCourses}
            onCourseClick={handleCourseClick}
          />
        </div>
        <div className="sidebar">
          <TrackStatus
            excludedCourses={excludedCourses}
            affectedCourses={affectedCourses}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color normal"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-color excluded"></span>
            <span>Not Taking</span>
          </div>
          <div className="legend-item">
            <span className="legend-color affected"></span>
            <span>Affected (Cannot Take)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
