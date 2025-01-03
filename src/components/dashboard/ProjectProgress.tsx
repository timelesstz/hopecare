import React from 'react';
import Link from 'next/link';
import { calculateProgress } from '@/lib/utils';

const projects = [
  {
    id: 'p1',
    name: 'Clean Water Initiative',
    raised: 15000,
    target: 20000,
    endDate: '2024-12-31',
  },
  {
    id: 'p2',
    name: 'Education for All',
    raised: 7500,
    target: 10000,
    endDate: '2024-12-25',
  },
  {
    id: 'p3',
    name: 'Healthcare Access',
    raised: 25000,
    target: 30000,
    endDate: '2025-01-15',
  },
];

export function ProjectProgress() {
  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const progress = calculateProgress(project.raised, project.target);
        const daysLeft = Math.ceil(
          (new Date(project.endDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return (
          <div key={project.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <Link
                href={`/projects/${project.id}`}
                className="text-sm font-medium text-gray-900 hover:text-rose-600"
              >
                {project.name}
              </Link>
              <span className="text-sm text-gray-500">
                {daysLeft} days left
              </span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${project.raised.toLocaleString()} raised
              </span>
              <span className="text-gray-900 font-medium">
                {progress}%
              </span>
            </div>
          </div>
        );
      })}

      <Link
        href="/projects"
        className="block text-center text-sm text-rose-600 hover:text-rose-700 font-medium"
      >
        View All Projects
      </Link>
    </div>
  );
}
