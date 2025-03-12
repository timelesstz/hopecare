import React, { useState, useEffect } from 'react';
import { Heart, Clock, Search, Filter } from 'lucide-react';
import { Donor } from '../../types/donor';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CircularProgress, Card, CardContent, LinearProgress, TextField, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

interface DonorProjectsProps {
  donor: Donor;
}

interface Project {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  category: string;
  endDate: string;
  createdAt: string;
}

const DonorProjects: React.FC<DonorProjectsProps> = ({ donor }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const categories = [
    'Education',
    'Health',
    'Environment',
    'Poverty',
    'Disaster Relief',
    'Animal Welfare',
    'Arts & Culture',
    'Human Rights',
    'Community Development',
    'Children & Youth'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(
        projectsRef,
        orderBy('createdAt', 'desc')
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData: Project[] = [];
      
      projectsSnapshot.forEach((doc) => {
        const data = doc.data();
        projectsData.push({
          id: doc.id,
          title: data.title || 'Untitled Project',
          description: data.description || '',
          goal: data.goal || 0,
          raised: data.raised || 0,
          imageUrl: data.imageUrl || 'https://via.placeholder.com/300x200',
          category: data.category || 'General',
          endDate: data.endDate || '',
          createdAt: data.createdAt || ''
        });
      });
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects
    .filter(project => {
      // Apply search filter
      if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !project.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply category filter
      if (categoryFilter !== 'all' && project.category !== categoryFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'most-funded') {
        return b.raised - a.raised;
      } else if (sortBy === 'least-funded') {
        return a.raised - b.raised;
      } else if (sortBy === 'goal-high-to-low') {
        return b.goal - a.goal;
      } else if (sortBy === 'goal-low-to-high') {
        return a.goal - b.goal;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress color="secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Projects</h2>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1 md:col-span-1">
            <TextField
              label="Search Projects"
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search className="h-4 w-4 mr-2 text-gray-400" />,
              }}
            />
          </div>
          
          <div>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <div>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="most-funded">Most Funded</MenuItem>
                <MenuItem value="least-funded">Least Funded</MenuItem>
                <MenuItem value="goal-high-to-low">Goal: High to Low</MenuItem>
                <MenuItem value="goal-low-to-high">Goal: Low to High</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        
        {/* Preferred Causes */}
        {donor.preferredCauses && donor.preferredCauses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Preferred Causes:</h3>
            <div className="flex flex-wrap gap-2">
              {donor.preferredCauses.map((cause, index) => (
                <Chip
                  key={index}
                  label={cause}
                  onClick={() => setCategoryFilter(cause)}
                  color={categoryFilter === cause ? "primary" : "default"}
                  variant={categoryFilter === cause ? "filled" : "outlined"}
                  sx={{ 
                    bgcolor: categoryFilter === cause ? '#fecdd3' : 'transparent',
                    color: categoryFilter === cause ? '#be123c' : 'inherit',
                    borderColor: categoryFilter === cause ? '#be123c' : 'inherit',
                    '&:hover': { bgcolor: categoryFilter === cause ? '#fecaca' : '#f5f5f5' }
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{project.title}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">${project.raised.toFixed(0)} raised</span>
                      <span className="text-gray-600">of ${project.goal.toFixed(0)}</span>
                    </div>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((project.raised / project.goal) * 100, 100)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: '#fee2e2',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#be123c',
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {project.endDate ? (
                        <>Ends {new Date(project.endDate).toLocaleDateString()}</>
                      ) : (
                        <>Ongoing</>
                      )}
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      Donate Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setSortBy('newest');
              }}
              className="mt-4 text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorProjects; 