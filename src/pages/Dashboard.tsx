import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import ProfileManager from '../components/volunteer/ProfileManager';
import OpportunityMatcher from '../components/volunteer/OpportunityMatcher';
import HourTracker from '../components/volunteer/HourTracker';
import VolunteerManager from '../components/admin/VolunteerManager';
import { volunteerService } from '../services/volunteerService';

interface DashboardProps {
  role?: 'volunteer' | 'admin';
}

const Dashboard: React.FC<DashboardProps> = ({ role = 'volunteer' }) => {
  const { user } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({
    upcoming_shifts: [],
    recent_hours: [],
    matched_opportunities: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getDashboardData(user?.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (role === 'admin') {
    return (
      <Container maxWidth="xl">
        <Box py={4}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <VolunteerManager />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Grid container spacing={4}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user?.avatar_url}
                    sx={{ width: 64, height: 64 }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h4" gutterBottom>
                    Welcome back, {user?.name}!
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Your volunteer journey continues here
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Hours
                </Typography>
                <Typography variant="h3" color="primary">
                  {dashboardData.total_hours?.toFixed(1) || '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours contributed to the community
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Assignments
                </Typography>
                <Typography variant="h3" color="primary">
                  {dashboardData.active_assignments || '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current volunteer commitments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Impact Score
                </Typography>
                <Typography variant="h3" color="primary">
                  {dashboardData.impact_score || '0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on hours and engagement
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Shifts */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Shifts
                </Typography>
                <List>
                  {dashboardData.upcoming_shifts.map((shift: any) => (
                    <ListItem key={shift.id}>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={shift.opportunity_title}
                        secondary={`${new Date(shift.start_time).toLocaleDateString()} - ${new Date(shift.start_time).toLocaleTimeString()}`}
                      />
                    </ListItem>
                  ))}
                  {dashboardData.upcoming_shifts.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No upcoming shifts"
                        secondary="Browse opportunities to find your next volunteer activity"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Calendar
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Recent Hours */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Hours
                </Typography>
                <List>
                  {dashboardData.recent_hours.map((log: any) => (
                    <ListItem key={log.id}>
                      <ListItemIcon>
                        <AccessTimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${log.hours} hours at ${log.opportunity_title}`}
                        secondary={new Date(log.date).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                  {dashboardData.recent_hours.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No recent hours logged"
                        secondary="Start logging your volunteer hours to track your impact"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Log Hours
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Recommended Opportunities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommended Opportunities
                </Typography>
                <Grid container spacing={3}>
                  {dashboardData.matched_opportunities.map((opportunity: any) => (
                    <Grid item xs={12} md={4} key={opportunity.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {opportunity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {opportunity.organization}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            {opportunity.description}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <GroupIcon fontSize="small" />
                            <Typography variant="body2">
                              {opportunity.spots_available} spots available
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button size="small" color="primary">
                            Learn More
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View All Opportunities
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {/* Handle action */}}
                  >
                    Find Opportunities
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {/* Handle action */}}
                  >
                    Log Hours
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {/* Handle action */}}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Error Notification */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 