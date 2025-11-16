import { tracks, getCourseById } from '../data';
import type { Track } from '../data';
import { isCourseAvailable } from '../utils/graphAlgorithms';

interface TrackStatusProps {
  excludedCourses: Set<string>;
  affectedCourses: Set<string>;
}

interface CourseStatus {
  id: string;
  name: string;
  available: boolean;
}

interface TrackInfo {
  track: Track;
  isComplete: boolean;
  courseStatuses: CourseStatus[];
}

const TrackStatus = ({ excludedCourses, affectedCourses }: TrackStatusProps) => {
  const trackInfos: TrackInfo[] = tracks.map(track => {
    const courseStatuses = track.requiredCourses.map(courseId => {
      const course = getCourseById(courseId);
      return {
        id: courseId,
        name: course?.name || courseId,
        available: isCourseAvailable(courseId, excludedCourses, affectedCourses)
      };
    });

    const isComplete = courseStatuses.every(cs => cs.available);

    return {
      track,
      isComplete,
      courseStatuses
    };
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%',
      overflowY: 'auto'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#374151',
        margin: 0
      }}>
        Track Status
      </h2>

      {trackInfos.map(({ track, isComplete, courseStatuses }) => (
        <div
          key={track.id}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: `2px solid ${isComplete ? '#10B981' : '#EF4444'}`,
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1F2937',
              margin: 0
            }}>
              {track.name}
            </h3>
            <span style={{
              fontSize: '1.25rem',
              color: isComplete ? '#10B981' : '#EF4444'
            }}>
              {isComplete ? '✓' : '✗'}
            </span>
          </div>

          <div style={{
            fontSize: '0.875rem',
            color: isComplete ? '#10B981' : '#EF4444',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            {isComplete ? 'Complete' : 'Incomplete'}
          </div>

          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none'
          }}>
            {courseStatuses.map(cs => (
              <li
                key={cs.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0',
                  fontSize: '0.875rem',
                  color: cs.available ? '#374151' : '#EF4444',
                  textDecoration: cs.available ? 'none' : 'line-through'
                }}
              >
                <span style={{
                  width: '1rem',
                  textAlign: 'center'
                }}>
                  {cs.available ? '○' : '✗'}
                </span>
                <span style={{ fontWeight: '500' }}>{cs.id}</span>
                <span style={{
                  color: '#6B7280',
                  fontSize: '0.75rem',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {cs.name}
                </span>
              </li>
            ))}
          </ul>

          {!isComplete && (
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#EF4444',
              fontStyle: 'italic'
            }}>
              Missing: {courseStatuses.filter(cs => !cs.available).map(cs => cs.id).join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackStatus;
