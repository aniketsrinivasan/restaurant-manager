import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Stack,
  Grid,
  Button,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { format } from 'date-fns';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const theme = useTheme();

  const stats = {
    dailyRevenue: 2450,
    totalCovers: 45,
    avgPartySize: 3.2,
    totalReservations: 12,
    avgSpendPerGuest: 54,
    pendingRequests: 3,
    specialDietary: {
      vegetarian: 8,
      vegan: 4,
      glutenFree: 3,
      allergies: 2
    }
  };

  const StatCard = ({ icon: Icon, label, value, subtext }) => (
    <Card sx={{ 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column',
      gap: 1,
      bgcolor: 'background.paper',
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.05)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon sx={{ color: 'grey.500' }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {value}
      </Typography>
      {subtext && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {subtext}
        </Typography>
      )}
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: '1400px' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4 
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Dashboard Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>
          <DatePicker 
            value={selectedDate}
            onChange={setSelectedDate}
            sx={{ 
              '& .MuiInputBase-root': { 
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          />
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={TrendingUpIcon}
              label="Daily Revenue"
              value={`$${stats.dailyRevenue}`}
              subtext={`$${stats.avgSpendPerGuest} per guest average`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={GroupsIcon}
              label="Total Covers"
              value={stats.totalCovers}
              subtext={`${stats.avgPartySize} average party size`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={EventIcon}
              label="Reservations"
              value={stats.totalReservations}
              subtext={`${stats.pendingRequests} pending requests`}
            />
          </Grid>
        </Grid>

        {/* Dietary Requirements Summary */}
        <Card sx={{ 
          mt: 3,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Dietary Requirements
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.specialDietary).map(([key, value]) => (
              <Grid item xs={6} sm={3} key={key}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'text.primary', mb: 1 }}>
                    {value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard; 