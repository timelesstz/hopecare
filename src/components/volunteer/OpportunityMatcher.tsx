import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import { volunteerService } from '../../services/volunteerService';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  organization: string;
  location: string;
  required_skills: string[];
  start_date: string;
  end_date: string;
  time_commitment: string;
  spots_available: number;
  match_score: number;
}

interface OpportunityMatcherProps {
  userId: string;
  onOpportunitySelect?: (opportunityId: string) => void;
}

const OpportunityMatcher: React.FC<OpportunityMatcherProps> = ({
  userId,
  onOpportunitySelect,
}) => {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, [userId]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getMatchedOpportunities(userId);
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDialog(true);
  };

  const handleApply = async (opportunityId: string) => {
    try {
      await volunteerService.applyForOpportunity(userId, opportunityId);
      onOpportunitySelect?.(opportunityId);
      setShowDialog(false);
      // Refresh opportunities to update spots available
      fetchOpportunities();
    } catch (error) {
      console.error('Error applying for opportunity:', error);
      setError('Failed to apply for opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) =>
    opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opportunity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Filter options">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Opportunities Grid */}
      <Grid container spacing={3}>
        {filteredOpportunities.map((opportunity) => (
          <Grid item xs={12} md={6} lg={4} key={opportunity.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {opportunity.title}
                  </Typography>
                  <Tooltip title={`${opportunity.match_score}% match`}>
                    <Box>
                      <Rating
                        value={opportunity.match_score / 20}
                        readOnly
                        precision={0.5}
                      />
                    </Box>
                  </Tooltip>
                </Box>

                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {opportunity.organization}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {opportunity.description}
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    icon={<LocationOnIcon />}
                    label={opportunity.location}
                    size="small"
                  />
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={opportunity.time_commitment}
                    size="small"
                  />
                  <Chip
                    icon={<GroupIcon />}
                    label={`${opportunity.spots_available} spots`}
                    size="small"
                  />
                </Box>

                <Box display="flex" flexWrap="wrap" gap={1}>
                  {opportunity.required_skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleOpportunityClick(opportunity)}
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Opportunity Detail Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOpportunity && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedOpportunity.title}</Typography>
              <Typography variant="subtitle1" color="primary">
                {selectedOpportunity.organization}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedOpportunity.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedOpportunity.location}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Time Commitment
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedOpportunity.time_commitment}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Date Range
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {new Date(selectedOpportunity.start_date).toLocaleDateString()} - {new Date(selectedOpportunity.end_date).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Spots Available
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedOpportunity.spots_available}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedOpportunity.required_skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleApply(selectedOpportunity.id)}
                disabled={selectedOpportunity.spots_available === 0}
              >
                Apply Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Error Notification */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default OpportunityMatcher; 