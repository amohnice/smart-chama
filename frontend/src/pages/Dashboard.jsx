import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

/**
 * Dashboard page displays key statistics for the chama.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalContributions: 0,
    pendingApprovals: 0,
    upcomingMeetings: 0,
    unreadNotifications: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [contributionData, setContributionData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role === 'admin';

      if (isAdmin) {
        const [statsRes, transactionsRes, notificationsRes, membersRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/transactions/recent'),
          api.get('/notifications'),
          api.get('/dashboard/members/recent')
        ]);

        setStats(statsRes.data);
        setRecentTransactions(transactionsRes.data);
        setNotifications(notificationsRes.data);
        setRecentMembers(membersRes.data);
      } else {
        const [statsRes, transactionsRes, notificationsRes, meetingsRes, loanRes] = await Promise.all([
          api.get('/members/dashboard/stats'),
          api.get('/members/transactions/recent'),
          api.get('/notifications'),
          api.get('/members/meetings/upcoming'),
          api.get('/members/loans/active')
        ]);

        setStats({
          ...statsRes.data,
          upcomingMeetings: meetingsRes.data.length,
          activeLoans: loanRes.data ? 1 : 0
        });
        setRecentTransactions(transactionsRes.data);
        setNotifications(notificationsRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values when API calls fail
      setStats({
        totalMembers: 0,
        activeLoans: 0,
        totalContributions: 0,
        pendingApprovals: 0,
        upcomingMeetings: 0,
        unreadNotifications: 0
      });
      setRecentTransactions([]);
      setRecentMembers([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  {isAdmin ? 'Total Members' : 'My Contributions'}
                </Typography>
              </Box>
              <Typography variant="h4">
                {isAdmin ? stats.totalMembers : stats.totalContributions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Upcoming Meetings
                </Typography>
              </Box>
              <Typography variant="h4">{stats.upcomingMeetings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  {isAdmin ? 'Active Loans' : 'My Loans'}
                </Typography>
              </Box>
              <Typography variant="h4">{stats.activeLoans}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Notifications
                </Typography>
              </Box>
              <Typography variant="h4">{stats.unreadNotifications}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Grid container spacing={2}>
              {notifications?.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
                  <Grid item xs={12} key={notification._id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle1">{notification.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" color="textSecondary" align="center">
                    No recent activity
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
