import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, MapPin, Calendar, Users } from 'lucide-react';
import { CMSProject } from '@/types/cms';
import { cmsService } from '@/lib/cms-service';
import { DonationTier } from '@/components/DonationTier';
import { useDonationTiers } from '@/hooks/useDonationTiers';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProjectPageProps {
  project?: CMSProject;
}

export default function ProjectPage({ project: initialProject }: ProjectPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<CMSProject | null>(initialProject || null);
  const [loading, setLoading] = useState(!initialProject);
  const { tiers, loading: tiersLoading } = useDonationTiers(project?.id);
  const { trackProjectView } = useAnalytics();

  // Fetch project data if not provided
  useEffect(() => {
    if (!initialProject && slug) {
      const fetchProject = async () => {
        setLoading(true);
        try {
          const projectData = await cmsService.getProjectBySlug(slug);
          setProject(projectData);
        } catch (error) {
          console.error('Error fetching project:', error);
          // Handle 404 or other errors
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [slug, initialProject]);

  // Handle loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Handle not found
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/projects')}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors"
        >
          Browse Projects
        </button>
      </div>
    );
  }

  // Track project view
  useEffect(() => {
    if (project) {
      trackProjectView(project.id);
    }
  }, [project?.id]);

  const progress = (project.raisedAmount / project.targetAmount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Details */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-6">
            <img
              src={project.coverImage.url}
              alt={project.coverImage.alt}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-medium">
              {project.category}
            </span>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(project.startDate).toLocaleDateString()}</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {project.title}
          </h1>

          <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: project.content }} />

          {project.gallery && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {project.gallery.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donation Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">
                  ${project.raisedAmount.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  of ${project.targetAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}% funded
                </span>
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{project.donorCount} donors</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {tiersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                tiers.map((tier) => (
                  <DonationTier
                    key={tier.id}
                    tier={tier}
                    isSelected={false}
                    onSelect={() => {
                      navigate(`/donation?projectId=${project.id}&tierId=${tier.id}`);
                    }}
                    donationType="one-time"
                  />
                ))
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => navigate(`/donation?projectId=${project.id}`)}
                className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                Donate Now
              </button>
              <button
                onClick={() => {
                  // Implement share functionality
                  navigator.share?.({
                    title: project.title,
                    text: project.description,
                    url: window.location.href,
                  }).catch(() => {
                    // Fallback to copy to clipboard
                    navigator.clipboard.writeText(window.location.href);
                  });
                }}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
