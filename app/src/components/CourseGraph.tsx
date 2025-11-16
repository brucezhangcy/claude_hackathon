import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { courses } from '../data';
import type { Course } from '../data';

interface CourseGraphProps {
  excludedCourses: Set<string>;
  affectedCourses: Set<string>;
  onCourseClick: (courseId: string) => void;
}

const CourseGraph = ({ excludedCourses, affectedCourses, onCourseClick }: CourseGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const onCourseClickRef = useRef(onCourseClick);

  // Keep callback ref updated
  onCourseClickRef.current = onCourseClick;

  // Initialize network once
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing network if any (for React Strict Mode)
    if (networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
    }

    // Create nodes array with current colors
    const getNodeColor = (courseId: string) => {
      if (excludedCourses.has(courseId)) {
        return { background: '#374151', border: '#1F2937' };
      } else if (affectedCourses.has(courseId)) {
        return { background: '#EF4444', border: '#DC2626' };
      }
      return { background: '#6B7280', border: '#4B5563' };
    };

    const nodes = courses.map((course: Course) => {
      const colors = getNodeColor(course.id);
      return {
        id: course.id,
        label: course.id,
        title: `${course.id}\n${course.name}`,
        color: {
          background: colors.background,
          border: colors.border,
          highlight: {
            background: colors.background,
            border: '#FFCC00'
          }
        },
        font: {
          color: '#FFFFFF',
          size: 14,
          face: 'Arial'
        },
        shape: 'box' as const,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        widthConstraint: { minimum: 80 }
      };
    });

    // Create edges array
    const edges = courses.flatMap((course: Course) =>
      course.prerequisites.map(prereq => ({
        id: `${prereq}-${course.id}`,
        from: prereq,
        to: course.id,
        arrows: 'to' as const,
        color: {
          color: '#9CA3AF',
          highlight: '#FFCC00'
        },
        width: 2
      }))
    );

    // Network options
    const options = {
      layout: {
        hierarchical: {
          direction: 'UD' as const,
          sortMethod: 'directed' as const,
          levelSeparation: 100,
          nodeSpacing: 150,
          treeSpacing: 200
        }
      },
      physics: false,
      interaction: {
        dragNodes: false,
        zoomView: true,
        dragView: true
      },
      nodes: {
        borderWidth: 2,
        borderWidthSelected: 3
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'cubicBezier' as const,
          forceDirection: 'vertical' as const,
          roundness: 0.5
        }
      }
    };

    // Create network
    const network = new Network(
      containerRef.current,
      { nodes, edges },
      options
    );

    networkRef.current = network;

    // Click handler
    network.on('click', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const courseId = params.nodes[0] as string;
        onCourseClickRef.current(courseId);
      }
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [excludedCourses, affectedCourses]); // Recreate network when selection changes

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        // Give the network a definite height so vis-network
        // has non-zero space to render into.
        height: '600px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      }}
    />
  );
};

export default CourseGraph;
