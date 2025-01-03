import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

const donations = [
  {
    id: '1',
    projectId: 'p1',
    projectName: 'Clean Water Initiative',
    projectImage: '/images/projects/water.jpg',
    amount: 150,
    date: '2024-12-10T15:30:00Z',
    status: 'completed',
  },
  {
    id: '2',
    projectId: 'p2',
    projectName: 'Education for All',
    projectImage: '/images/projects/education.jpg',
    amount: 75,
    date: '2024-12-08T10:15:00Z',
    status: 'completed',
  },
  {
    id: '3',
    projectId: 'p3',
    projectName: 'Healthcare Access',
    projectImage: '/images/projects/healthcare.jpg',
    amount: 200,
    date: '2024-12-05T09:45:00Z',
    status: 'completed',
  },
];

export function RecentDonations() {
  if (donations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No donations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={donation.projectImage}
              alt={donation.projectName}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <Link
              href={`/projects/${donation.projectId}`}
              className="text-sm font-medium text-gray-900 hover:text-rose-600 truncate block"
            >
              {donation.projectName}
            </Link>
            <div className="text-sm text-gray-500">
              {formatDate(donation.date)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatCurrency(donation.amount)}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {donation.status}
            </div>
          </div>
        </div>
      ))}

      <Link
        href="/dashboard/donations"
        className="block text-center text-sm text-rose-600 hover:text-rose-700 font-medium"
      >
        View All Donations
      </Link>
    </div>
  );
}
