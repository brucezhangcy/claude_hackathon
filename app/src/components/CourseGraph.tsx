import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { courses } from '../data';
import type { Course } from '../data';

interface CourseGraphProps {
  excludedCourses: Set<string>;
  affectedCourses: Set<string>;
  onCourseClick: (courseId: string) => void;
  // New: courses the user has completed (taken)
  completedCourses: Set<string>;
}

const CourseGraph = ({ excludedCourses, affectedCourses, onCourseClick, completedCourses }: CourseGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  // Dynamic zoom limits
  const minScaleRef = useRef<number>(0.2);
  const maxScaleRef = useRef<number>(2.5);
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
      // If course is marked as taken, color green
      if (completedCourses.has(courseId)) {
        return { background: '#10B981', border: '#059669' };
      }
      // If course is affected (cannot take), color red
      if (affectedCourses.has(courseId)) {
        return { background: '#EF4444', border: '#DC2626' };
      }
      // Default: not taken (gray)
      return { background: '#374151', border: '#1F2937' };
    };

    const nodes = courses.map((course: Course) => {
      const colors = getNodeColor(course.id);
      const prereqList = course.prerequisites.length > 0 ? course.prerequisites.join(', ') : 'None';
      const isAvailableNext = !completedCourses.has(course.id)
        && !excludedCourses.has(course.id)
        && !affectedCourses.has(course.id)
        && (course.prerequisites.length === 0 || course.prerequisites.every(pr => completedCourses.has(pr)));

      const borderColor = isAvailableNext ? '#2563EB' : colors.border;
      const borderWidth = isAvailableNext ? 3 : 2;

      return {
        id: course.id,
        label: course.id,
        title: `${course.id}\n${course.name}\nPrereqs: ${prereqList}\nAvailable Next: ${isAvailableNext ? 'Yes' : 'No'}`,
        color: {
          background: colors.background,
          border: borderColor,
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
        widthConstraint: { minimum: 80 },
        borderWidth
      };
    });

    // Create edges array
    const edges = courses.flatMap((course: Course) =>
      course.prerequisites.map(prereq => {
        const isLit = completedCourses.has(prereq) && completedCourses.has(course.id);
        return {
          id: `${prereq}-${course.id}`,
          from: prereq,
          to: course.id,
          arrows: 'to' as const,
          color: {
            color: isLit ? '#FFCC00' : '#9CA3AF',
            highlight: '#FFCC00'
          },
          width: isLit ? 3 : 2
        };
      })
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
        dragView: false,
        keyboard: {
          enabled: true,
          speed: { x: 10, y: 10, zoom: 0.02 }
        }
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

    // Compute dynamic zoom limits based on graph and container size
    const computeZoomLimits = () => {
      const net = networkRef.current;
      const container = containerRef.current;
      if (!net || !container) return;

      const rect = container.getBoundingClientRect();
      let minLeft = Infinity;
      let minTop = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;
      const widths: number[] = [];

      // Measure bounding boxes of all nodes
      courses.forEach((c) => {
        try {
          const bb: any = net.getBoundingBox(c.id);
          const w = bb.right - bb.left;
          widths.push(w);
          if (bb.left < minLeft) minLeft = bb.left;
          if (bb.top < minTop) minTop = bb.top;
          if (bb.right > maxRight) maxRight = bb.right;
          if (bb.bottom > maxBottom) maxBottom = bb.bottom;
        } catch (e) {
          // ignore nodes without bounding box yet
        }
      });

      const graphWidth = maxRight - minLeft;
      const graphHeight = maxBottom - minTop;
      if (graphWidth > 0 && graphHeight > 0) {
        // Minimum zoom: fit entire graph into container
        const fitScale = Math.min(rect.width / graphWidth, rect.height / graphHeight) * 0.95;
        minScaleRef.current = Math.max(0.01, fitScale);
      }

      if (widths.length > 0) {
        // Maximum zoom: roughly one block fills the window
        const avgNodeWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
        const maxScale = (rect.width / avgNodeWidth) * 0.95;
        // Keep maxScale reasonable and above minScale
        maxScaleRef.current = Math.min(Math.max(maxScale, minScaleRef.current * 1.2), 5);
      }
    };

    // Compute limits after first draw
    network.once('afterDrawing', computeZoomLimits);
    // Recompute on window resize
    window.addEventListener('resize', computeZoomLimits);

    // Clamp zoom changes from keyboard/trackpad initiated by the library
    network.on('zoom', (params: any) => {
      const net = networkRef.current;
      if (!net) return;
      const s = params.scale as number;
      const clamped = Math.max(minScaleRef.current, Math.min(maxScaleRef.current, s));
      if (clamped !== s) {
        net.moveTo({ scale: clamped });
      }
    });
    // Enable sliding with mouse wheel / trackpad
    const containerEl = containerRef.current;
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const net = networkRef.current;
      if (!net) return;

      if (e.ctrlKey || e.metaKey) {
        // Zoom in/out with ctrl/cmd + scroll
        const scale = net.getScale();
        const zoomFactor = 1 + (-e.deltaY) * 0.001; // invert deltaY for intuitive zoom
        let newScale = scale * zoomFactor;
        // Clamp zoom range dynamically between min (fit all) and max (one block)
        newScale = Math.max(minScaleRef.current, Math.min(maxScaleRef.current, newScale));
        net.moveTo({ scale: newScale });
      } else {
        // Direction-aware pan by scrolling
        const scale = net.getScale();
        const pos = net.getViewPosition();

        // Compute deltas in view-space
        let dx = e.deltaX / scale;
        let dy = e.deltaY / scale;

        // Axis locking rules:
        // - Shift key: force horizontal-only pan
        // - Alt/Option key: force vertical-only pan
        // - Otherwise, choose dominant axis based on magnitude
        if (e.shiftKey) {
          dy = 0;
        } else if (e.altKey) {
          dx = 0;
        } else {
          const ax = Math.abs(e.deltaX);
          const ay = Math.abs(e.deltaY);
          // If one axis is clearly dominant, lock to that axis
          if (ax > ay * 1.2) {
            dy = 0;
          } else if (ay > ax * 1.2) {
            dx = 0;
          }
          // If similar magnitude, allow diagonal pan (no locking)
        }

        net.moveTo({
          position: {
            x: pos.x + dx,
            y: pos.y + dy
          },
          scale
        });
      }
    };
    containerEl?.addEventListener('wheel', wheelHandler, { passive: false });

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
      containerEl?.removeEventListener('wheel', wheelHandler);
      window.removeEventListener('resize', computeZoomLimits);
    };
  }, [excludedCourses, affectedCourses, completedCourses]); // Recreate network when selection changes

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
