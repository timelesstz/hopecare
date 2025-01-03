import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, X } from 'lucide-react';

interface ShareProjectProps {
  project: {
    id: number;
    title: string;
    description: string;
  };
  onClose: () => void;
}

const ShareProject: React.FC<ShareProjectProps> = ({ project, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/donate?project=${project.id}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Support ${project.title} at HopeCare`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Support ${project.title} at HopeCare`)}&body=${encodeURIComponent(`I thought you might be interested in supporting this project:\n\n${project.title}\n\n${project.description}\n\n${shareUrl}`)}`
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Share Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center space-x-6">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 transition"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href={shareLinks.email}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>

          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full pr-20 pl-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-rose-600 hover:text-rose-700 flex items-center"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareProject;