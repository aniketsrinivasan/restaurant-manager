import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Stack,
  IconButton,
  Divider,
  Avatar,
  Button,
  useTheme,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VipIcon from '@mui/icons-material/Stars';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { format } from 'date-fns';
import { fetchReservations as fetchReservationsApi } from '../api';
import SearchIcon from '@mui/icons-material/Search';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CelebrationIcon from '@mui/icons-material/Celebration';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EmailIcon from '@mui/icons-material/Email';
import RateReviewIcon from '@mui/icons-material/RateReview';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.05)',
      flex: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Box sx={{ color }}>
        {React.cloneElement(icon, { fontSize: 'small' })}
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {value}
    </Typography>
  </Box>
);

const ReservationStats = ({ reservations }) => {
  const stats = useMemo(() => ({
    totalGuests: reservations.reduce((sum, r) => sum + r.number_of_guests, 0),
    totalOrders: reservations.reduce((sum, r) => sum + r.food_ordered.length, 0),
    specialRequests: reservations.filter(r => r.special_requests.length > 0).length,
  }), [reservations]);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <StatCard
        title="Total Guests"
        value={stats.totalGuests}
        icon={<PeopleIcon />}
        color="primary.main"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={<RestaurantIcon />}
        color="success.main"
      />
      <StatCard
        title="Special Requests"
        value={stats.specialRequests}
        icon={<AssignmentIcon />}
        color="warning.main"
      />
    </Box>
  );
};

const TRANSITION_DURATION = '0.3s';  // Consistent transition duration

const fadeInAnimation = {
  opacity: 0,
  animation: `fadeIn ${TRANSITION_DURATION} ease forwards`,
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  }
};

const expandAnimation = {
  overflow: 'hidden',
  transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
};

const ModernToggle = ({ label, checked, onChange, tooltip }) => (
  <Tooltip title={tooltip} placement="top">
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': {
          '& .toggle-track': {
            bgcolor: checked 
              ? 'primary.light'
              : 'rgba(255, 255, 255, 0.15)',
          },
          '& .toggle-text': {
            color: checked 
              ? 'primary.light' 
              : 'text.primary',
          }
        }
      }}
      onClick={() => onChange(!checked)}
    >
      <Box
        className="toggle-track"
        sx={{
          width: '32px',
          height: '18px',
          borderRadius: '9px',
          position: 'relative',
          bgcolor: checked ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
          transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <Box
          sx={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            bgcolor: 'white',
            transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        />
      </Box>
      <Typography
        className="toggle-text"
        variant="body2"
        sx={{
          fontSize: '0.85rem',
          color: checked ? 'primary.main' : 'text.secondary',
          transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {label}
      </Typography>
    </Box>
  </Tooltip>
);

const SmartInsights = ({ reservations }) => {
  const insights = useMemo(() => {
    // Special occasions
    const specialOccasions = reservations.filter(res => 
      res.special_requests.some(req => 
        req.toLowerCase().includes('birthday') ||
        req.toLowerCase().includes('anniversary') ||
        req.toLowerCase().includes('proposal') ||
        req.toLowerCase().includes('celebrate')
      )
    );

    // Popular dishes
    const dishCounts = reservations.reduce((acc, res) => {
      res.food_ordered.forEach(order => {
        acc[order.item] = (acc[order.item] || 0) + order.quantity;
      });
      return acc;
    }, {});
    const popularDishes = Object.entries(dishCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([dish]) => dish);

    // VIP analysis
    const vipCount = reservations.filter(res => res.is_vip).length;

    // Average party size
    const avgPartySize = (
      reservations.reduce((sum, r) => sum + r.number_of_guests, 0) / 
      reservations.length
    ).toFixed(1);

    // Revenue insights
    const revenue = reservations.reduce((sum, r) => 
      sum + r.food_ordered.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      ), 0
    );

    return {
      specialOccasions: specialOccasions.length,
      specialOccasionDetails: specialOccasions.map(res => ({
        name: res.client_name,
        request: res.special_requests.find(req => 
          req.toLowerCase().includes('birthday') ||
          req.toLowerCase().includes('anniversary') ||
          req.toLowerCase().includes('proposal') ||
          req.toLowerCase().includes('celebrate')
        )
      })),
      popularDishes,
      vipCount,
      totalGuests: reservations.reduce((sum, r) => sum + r.number_of_guests, 0),
      avgPartySize,
      revenue,
    };
  }, [reservations]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TipsAndUpdatesIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6">Smart Insights</Typography>
      </Box>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 2 
      }}>
        {/* Special Occasions Card */}
        <Tooltip title={
          insights.specialOccasionDetails.map(detail => 
            `${detail.name}: ${detail.request}`
          ).join('\n')
        }>
          <Card sx={{ p: 2, bgcolor: 'rgba(144, 202, 249, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CelebrationIcon sx={{ color: 'primary.light' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Special Occasions
              </Typography>
            </Box>
            <Typography variant="h6">
              {insights.specialOccasions} celebrations today
            </Typography>
          </Card>
        </Tooltip>

        {/* Popular Dishes Card */}
        <Card sx={{ p: 2, bgcolor: 'rgba(144, 202, 249, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ color: 'primary.light' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Trending Dishes
            </Typography>
          </Box>
          <Typography variant="body1">
            {insights.popularDishes.join(', ')}
          </Typography>
        </Card>

        {/* Guest Summary Card */}
        <Card sx={{ p: 2, bgcolor: 'rgba(144, 202, 249, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GroupsIcon sx={{ color: 'primary.light' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Guest Summary
            </Typography>
          </Box>
          <Typography variant="body1" component="div">
            <Box sx={{ mb: 0.5 }}>
              {insights.totalGuests} total guests
            </Box>
            <Box>
              {insights.vipCount} VIP {insights.vipCount === 1 ? 'guest' : 'guests'}
            </Box>
          </Typography>
        </Card>

        {/* Revenue Card */}
        <Card sx={{ p: 2, bgcolor: 'rgba(144, 202, 249, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MonetizationOnIcon sx={{ color: 'primary.light' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Expected Revenue
            </Typography>
          </Box>
          <Typography variant="h6">
            ${insights.revenue.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Avg ${(insights.revenue / reservations.length).toFixed(2)} per reservation
          </Typography>
        </Card>

        {/* Party Size Card */}
        <Card sx={{ p: 2, bgcolor: 'rgba(144, 202, 249, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GroupsIcon sx={{ color: 'primary.light' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Average Party Size
            </Typography>
          </Box>
          <Typography variant="h6">
            {insights.avgPartySize} guests
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

const OriginalDataDialog = ({ open, onClose, originalData }) => (
  <Dialog 
    open={open} 
    onClose={onClose} 
    maxWidth="md" 
    fullWidth
    TransitionProps={{
      timeout: parseInt(TRANSITION_DURATION) * 1000,
      style: {
        transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`
      }
    }}
  >
    <DialogTitle sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      pb: 2
    }}>
      <CompareArrowsIcon />
      Original Request Data
    </DialogTitle>
    <DialogContent>
      {/* Basic Info Section */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InfoIcon sx={{ color: 'primary.light' }} />
          <Typography variant="h6">Basic Information</Typography>
        </Box>
        <Box sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: 1,
          p: 2
        }}>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Name:</strong> {originalData?.name}
            </Typography>
            {originalData?.reservations?.map((res, index) => (
              <Box key={index}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Original Reservation Details:</strong>
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(res.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Number of People:</strong> {res.number_of_people}
                  </Typography>
                  {res.orders && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Original Orders:</strong>
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {res.orders.map((order, idx) => (
                          <Box key={idx}>
                            <Typography variant="body2">
                              • {order.item} - ${order.price}
                              {order.dietary_tags?.length > 0 && (
                                <Typography component="span" sx={{ color: 'text.secondary' }}>
                                  {' '}(Dietary: {order.dietary_tags.join(', ')})
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <RateReviewIcon sx={{ color: 'primary.light' }} />
          <Typography variant="h6">Customer History</Typography>
        </Box>
        {originalData?.reviews.map((review, index) => (
          <Box key={index} sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              right: 0,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'rgba(255, 215, 0, 0.1)',
              borderBottomLeftRadius: 1,
            }}>
              <StarIcon sx={{ fontSize: '0.9rem', color: 'gold' }} />
              <Typography variant="caption" sx={{ color: 'gold' }}>
                {review.rating}/5
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {review.restaurant_name} - {review.date}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {review.content}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Emails Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EmailIcon sx={{ color: 'primary.light' }} />
          <Typography variant="h6">Recent Communications</Typography>
        </Box>
        {originalData?.emails.map((email, index) => (
          <Box key={index} sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.05)'
          }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1,
              color: 'primary.light',
              fontWeight: 500
            }}>
              {email.subject}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              display: 'block',
              mb: 2
            }}>
              Sent on {new Date(email.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {email.combined_thread}
            </Typography>
          </Box>
        ))}
      </Box>
    </DialogContent>
    <DialogActions>
      <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary', pl: 2 }}>
        Original data from customer relationship management system
      </Typography>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const DietaryTag = ({ label }) => (
  <Typography
    component="span"
    sx={{
      fontSize: '0.7rem',
      px: 1,
      py: 0.5,
      borderRadius: 1,
      bgcolor: 'rgba(255, 255, 255, 0.05)',
      color: 'text.secondary',
      mr: 1,
    }}
  >
    {label}
  </Typography>
);

const ReservationDetails = ({ reservation, visibleSections }) => {
  // Move previousVisits calculation inside the component
  const previousVisits = useMemo(() => {
    return reservation?.original_data?.reviews.filter(
      review => review.restaurant_name.toLowerCase() === 'french laudure'
    ) || [];
  }, [reservation?.original_data]);

  const [showPreviousVisits, setShowPreviousVisits] = useState(false);

  return (
    <Box sx={{ 
      mt: 2, 
      pl: 7,
      ...fadeInAnimation,
      ...expandAnimation
    }}>
      {/* Preferences */}
      {visibleSections.preferences && reservation.preferences && (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Preferences:
              </Typography>
              {reservation.preferences.map((pref, idx) => (
                <Box
                  key={idx}
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                >
                  {pref}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Food Orders */}
      {visibleSections.foodOrders && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Food Orders:
          </Typography>
          {reservation.food_ordered.map((order, idx) => (
            <Box key={idx} sx={{ mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {order.quantity}x {order.item} - ${order.price}
                {order.dietary_tags.length > 0 && (
                  <Box component="span" sx={{ ml: 1 }}>
                    {order.dietary_tags.map(tag => (
                      <DietaryTag key={tag} label={tag} />
                    ))}
                  </Box>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Special Requests */}
      {visibleSections.specialRequests && reservation.special_requests.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Special Requests:
          </Typography>
          {reservation.special_requests.map((request, idx) => (
            <Typography 
              key={idx} 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                '&:before': {
                  content: '"•"',
                  mr: 1,
                  color: 'primary.main'
                }
              }}
            >
              {request}
            </Typography>
          ))}
        </Box>
      )}

      {/* Previous Visits to French Laudure */}
      {previousVisits.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={() => setShowPreviousVisits(!showPreviousVisits)}
            sx={{
              color: 'text.secondary',
              p: 0.75,
              justifyContent: 'flex-start',
              width: '100%',
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                transform: 'translateY(-1px)',
              },
              transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
              mb: showPreviousVisits ? 2 : 0
            }}
            endIcon={showPreviousVisits ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          >
            <HistoryIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Previous Visits ({previousVisits.length})
          </Button>
          
          {showPreviousVisits && (
            <Stack 
              spacing={2}
              sx={{
                ...fadeInAnimation,
                ...expandAnimation
              }}
            >
              {previousVisits.map((review, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    position: 'relative',
                    transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}>
                    <StarIcon sx={{ fontSize: '0.9rem', color: 'gold' }} />
                    <Typography variant="caption" sx={{ color: 'gold' }}>
                      {review.rating}/5
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Visited on {new Date(review.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {review.content}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

// Retry utility function
const withRetry = async (operation, maxAttempts = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error);
      
      if (attempt < maxAttempts) {
        // Add exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Wrapped fetch function with retry logic
const fetchReservations = async () => {
  return withRetry(async () => {
    const data = await fetchReservationsApi();
    
    // Validate the expected structure
    if (!data || !data.reservations || !Array.isArray(data.reservations)) {
      throw new Error('Invalid data format: expected {metadata, reservations}');
    }

    // Return the entire data object
    return {
      ...data,
      reservations: data.reservations.map(reservation => {
        try {
          return {
            ...reservation,
            date: new Date(reservation.date), // Validate date
            number_of_guests: parseInt(reservation.number_of_guests) || 0,
            food_ordered: Array.isArray(reservation.food_ordered) 
              ? reservation.food_ordered 
              : [],
            special_requests: Array.isArray(reservation.special_requests) 
              ? reservation.special_requests 
              : [],
            preferences: Array.isArray(reservation.preferences) 
              ? reservation.preferences 
              : [],
          };
        } catch (error) {
          console.error('Error processing reservation:', error);
          // Return a safe default reservation object
          return {
            client_name: reservation.client_name || 'Unknown',
            date: new Date(),
            number_of_guests: 0,
            food_ordered: [],
            special_requests: [],
            preferences: [],
            is_vip: false,
          };
        }
      })
    };
  });
};

const Reservations = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllDates, setShowAllDates] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    foodOrders: true,
    specialRequests: true,
    preferences: true,
    vipStatus: true,
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    vipOnly: false,
    hasSpecialRequests: false,
    hasDietaryRestrictions: false,
  });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [showOriginalData, setShowOriginalData] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchReservations();
        // Check if data has the expected structure
        if (data && data.reservations) {
          setReservations(data.reservations);
          setLastUpdated(data.metadata?.processed_at);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
        setError('Failed to load reservations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReservations();
  }, []);

  const filterOptions = [
    { 
      key: 'foodOrders', 
      label: 'Orders', 
      icon: '🍽️',
      tooltip: 'Show/hide ordered items and their details' 
    },
    { 
      key: 'specialRequests', 
      label: 'Requests', 
      icon: '📝',
      tooltip: 'Show/hide special requests from guests' 
    },
    { 
      key: 'preferences', 
      label: 'Preferences', 
      icon: '⭐',
      tooltip: 'Show/hide guest preferences based on history' 
    },
    { 
      key: 'vipStatus', 
      label: 'VIP Status', 
      icon: '👑',
      tooltip: 'Show/hide VIP status indicators' 
    },
  ];

  const toggleFilter = (key) => {
    setVisibleSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFilterChange = (key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const VipBadge = ({ isVip }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: isVip ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
        color: isVip ? 'gold' : 'error.light',
      }}
    >
      <VipIcon fontSize="small" />
      <Typography variant="caption">
        {isVip ? 'VIP' : 'Not VIP'}
      </Typography>
    </Box>
  );

  // Update filtered reservations to include search and advanced filters
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];

    // Date filtering
    if (!showAllDates) {
      // Format both dates to compare just the date part (ignoring time)
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(res => {
        const reservationDateStr = format(new Date(res.date), 'yyyy-MM-dd');
        return reservationDateStr === selectedDateStr;
      });
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(res => 
        res.client_name.toLowerCase().includes(query) ||
        res.special_requests.some(req => req.toLowerCase().includes(query)) ||
        res.food_ordered.some(order => order.item.toLowerCase().includes(query))
      );
    }

    // Advanced filters
    if (advancedFilters.vipOnly) {
      filtered = filtered.filter(res => res.is_vip === true);
    }
    if (advancedFilters.hasSpecialRequests) {
      filtered = filtered.filter(res => res.special_requests.length > 0);
    }
    if (advancedFilters.hasDietaryRestrictions) {
      filtered = filtered.filter(res => 
        res.food_ordered.some(order => order.dietary_tags.length > 0)
      );
    }

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [reservations, selectedDate, showAllDates, searchQuery, advancedFilters]);

  const handleMenuClick = (event, reservation) => {
    setSelectedReservation(reservation);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewOriginalData = () => {
    setShowOriginalData(true);
    handleMenuClose();
  };

  if (loading) {
    return <div className="text-center p-4">Loading reservations...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: 3, 
        maxWidth: '1400px',
        mx: 'auto',  // Center the content
        width: '100%'
      }}>
        {/* Header with Last Updated Time */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4 
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
              Reservations
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {showAllDates 
                ? 'All Dates' 
                : format(selectedDate, 'EEEE, MMMM d, yyyy')
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant={showAllDates ? "contained" : "outlined"}
              size="small"
              onClick={() => setShowAllDates(!showAllDates)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {showAllDates ? 'Show Single Date' : 'Show All Dates'}
            </Button>
            <DatePicker 
              value={selectedDate}
              onChange={setSelectedDate}
              disabled={showAllDates}
              sx={{ 
                '& .MuiInputBase-root': { 
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  opacity: showAllDates ? 0.5 : 1,
                }
              }}
            />
          </Box>
        </Box>

        {/* Statistics Panel */}
        <ReservationStats reservations={filteredReservations} />

        {/* Smart Insights */}
        <SmartInsights reservations={filteredReservations} />

        {/* Main Reservations Card */}
        <Card sx={{ 
          p: 3, 
          bgcolor: 'background.paper',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.05)',
          transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}>
          {/* Filters Section */}
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              sx={{
                color: 'text.secondary',
                p: 0.75,
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 1,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateY(-1px)',
                },
                transition: `all ${TRANSITION_DURATION} cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
              endIcon={isFilterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              <FilterListIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              Display Options
            </Button>
            
            {isFilterExpanded && (
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 1.5,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 1,
              }}>
                {filterOptions.map((option) => (
                  <Tooltip key={option.key} title={option.tooltip} placement="top">
                    <Button
                      variant={visibleSections[option.key] ? "contained" : "outlined"}
                      size="small"
                      onClick={() => toggleFilter(option.key)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        bgcolor: visibleSections[option.key] 
                          ? 'rgba(144, 202, 249, 0.16)'
                          : 'transparent',
                        borderColor: visibleSections[option.key]
                          ? 'primary.main'
                          : 'rgba(255, 255, 255, 0.1)',
                        color: visibleSections[option.key]
                          ? 'primary.main'
                          : 'text.secondary',
                        '&:hover': {
                          bgcolor: visibleSections[option.key]
                            ? 'rgba(144, 202, 249, 0.24)'
                            : 'rgba(255, 255, 255, 0.05)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }
                      }}
                    >
                      <Box sx={{ mr: 0.5 }}>{option.icon}</Box>
                      {option.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            )}
          </Box>

          {/* Search and Advanced Filters */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search reservations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  fontSize: '0.85rem',
                  py: 1,
                }
              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <ModernToggle
                label="VIP Only"
                checked={advancedFilters.vipOnly}
                onChange={(checked) => handleFilterChange('vipOnly', checked)}
                tooltip="Show only VIP guest reservations"
              />
              <ModernToggle
                label="Has Special Requests"
                checked={advancedFilters.hasSpecialRequests}
                onChange={(checked) => handleFilterChange('hasSpecialRequests', checked)}
                tooltip="Show only reservations with special requests"
              />
              <ModernToggle
                label="Has Dietary Restrictions"
                checked={advancedFilters.hasDietaryRestrictions}
                onChange={(checked) => handleFilterChange('hasDietaryRestrictions', checked)}
                tooltip="Show only reservations with dietary restrictions"
              />
            </Box>
          </Box>

          {/* Reservations List */}
          <Stack spacing={2}>
            {filteredReservations.map((reservation, index) => (
              <Box key={index}>
                {index > 0 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column'
                }}>
                  {/* Reservation Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#2d2d2d',
                          width: 40,
                          height: 40,
                          color: 'text.primary',
                        }}
                      >
                        {reservation.avatar || getInitials(reservation.client_name)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {reservation.client_name}
                          </Typography>
                          {visibleSections.vipStatus && <VipBadge isVip={reservation.is_vip} />}
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                        }}>
                          {format(new Date(reservation.date), 'MMM d, yyyy')} · {reservation.number_of_guests} guests
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'text.secondary' }}
                      onClick={(e) => handleMenuClick(e, reservation)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Reservation Details */}
                  <ReservationDetails 
                    reservation={reservation} 
                    visibleSections={visibleSections}
                  />
                </Box>
              </Box>
            ))}
            {filteredReservations.length === 0 && (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center',
                color: 'text.secondary' 
              }}>
                {showAllDates 
                  ? 'No reservations found'
                  : 'No reservations for this date'
                }
              </Box>
            )}
          </Stack>
        </Card>

        {/* Add Menu and Dialog */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewOriginalData}>
            <VisibilityIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            View Original Data
          </MenuItem>
        </Menu>

        <OriginalDataDialog
          open={showOriginalData}
          onClose={() => setShowOriginalData(false)}
          originalData={selectedReservation?.original_data}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Reservations; 