import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Stack,
  IconButton,
  Divider,
  Avatar,
  Button,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { format } from 'date-fns';

const Reservations = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    contactInfo: true,
    reservationMessage: true,
    orderedItems: true,
    specialRequests: true,
    financialInfo: true
  });

  const theme = useTheme();

  const reservations = [
    {
      time: '19:00',
      name: 'Emily Chen',
      guests: 4,
      isVip: true,
      email: 'emily.chen@email.com',
      phone: '+1 (555) 123-4567',
      avatar: 'EC',
      message: "Since my cousin decided to join us, can we adjust our table for one more person? Also, I'd love details on the gluten-free amuse-bouche if possible.",
      totalCost: 77,
      items: [
        { 
          name: 'Duck Confit', 
          quantity: 1,
          dietary: ['gluten-free']
        },
        { 
          name: 'Salmon Tartare', 
          quantity: 1,
          dietary: ['nut-free']
        }
      ],
      specialRequests: [
        'Gluten-free options needed',
        'Additional guest added',
        'Window seat if possible'
      ],
      status: 'confirmed',
      deposit: 30
    },
    {
      time: '19:30',
      name: 'David Martinez',
      guests: 2,
      isVip: true,
      email: 'david.m@email.com',
      phone: '+1 (555) 987-6543',
      avatar: 'DM',
      message: "Coming back with a VIP client. Could we use the private dining area again? He prefers a more confidential atmosphere.",
      totalCost: 73,
      items: [
        { 
          name: 'Beef Bourguignon', 
          quantity: 1,
          dietary: []
        },
        { 
          name: 'Chocolate Soufflé', 
          quantity: 1,
          dietary: []
        }
      ],
      specialRequests: [
        'Private dining area requested',
        'Special amuse-bouche inquiry',
        'Wine pairing recommendations needed'
      ],
      status: 'confirmed',
      deposit: 40
    },
    {
      time: '20:00',
      name: 'Karen Wu',
      guests: 3,
      isVip: false,
      email: 'karen.wu@email.com',
      phone: '+1 (555) 234-5678',
      avatar: 'KW',
      message: "I'm bringing my father-in-law who uses a wheelchair. Is the entrance step-free? Also, does the tasting menu accommodate a less spicy palate?",
      totalCost: 180,
      items: [
        { 
          name: "Chef's Tasting Menu", 
          quantity: 3,
          dietary: ['mild-spice']
        }
      ],
      specialRequests: [
        'Wheelchair accessibility needed',
        'Less spicy preparation requested',
        'Easy access table location'
      ],
      status: 'confirmed',
      deposit: 90
    },
    {
      time: '20:30',
      name: 'Olivia Morris',
      guests: 2,
      isVip: false,
      email: 'olivia.m@email.com',
      phone: '+1 (555) 345-6789',
      avatar: 'OM',
      message: "Hi, I'm planning to announce our engagement at dinner, but we want it very low-key. Could a staff member bring two glasses of champagne with no big announcement?",
      totalCost: 60,
      items: [
        { 
          name: 'Boeuf Bourguignon', 
          quantity: 2,
          dietary: []
        }
      ],
      specialRequests: [
        'Quiet celebration preferred',
        'Champagne service requested',
        'Romantic table setting'
      ],
      status: 'confirmed',
      deposit: 30
    },
    {
      time: '21:00',
      name: 'Quinn Stevens',
      guests: 2,
      isVip: false,
      email: 'quinn.s@email.com',
      phone: '+1 (555) 456-7890',
      avatar: 'QS',
      message: "We want to celebrate on Dec 30 before the new year madness. Do you have a special holiday menu preview? Also, I'm allergic to peanuts.",
      totalCost: 48,
      items: [
        { 
          name: 'Lobster Bisque', 
          quantity: 2,
          dietary: ['nut-free']
        }
      ],
      specialRequests: [
        'Nut allergy - strict avoidance',
        'Holiday menu inquiry',
        'Pre-New Year celebration'
      ],
      status: 'pending',
      deposit: 25
    }
  ];

  const filterOptions = [
    { key: 'contactInfo', label: 'Contact Info', icon: '📞' },
    { key: 'reservationMessage', label: 'Message', icon: '✉️' },
    { key: 'orderedItems', label: 'Orders', icon: '🍽️' },
    { key: 'specialRequests', label: 'Requests', icon: '📝' },
    { key: 'financialInfo', label: 'Financial', icon: '💰' }
  ];

  const toggleFilter = (key) => {
    setVisibleSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  const ReservationDetails = ({ reservation }) => (
    <Box sx={{ mt: 2, pl: 7 }}>
      {/* Contact Info */}
      {visibleSections.contactInfo && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          📧 {reservation.email} · 📱 {reservation.phone}
        </Typography>
      )}

      {/* Reservation Message */}
      {visibleSections.reservationMessage && reservation.message && (
        <Box sx={{ 
          mb: 2,
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          borderLeft: '3px solid',
          borderColor: 'primary.main'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            "{reservation.message}"
          </Typography>
        </Box>
      )}

      {/* Items Ordered */}
      {visibleSections.orderedItems && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
            Items Ordered:
          </Typography>
          {reservation.items.map((item, idx) => (
            <Box key={idx} sx={{ mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.quantity}x {item.name}
                {item.dietary.length > 0 && (
                  <Box component="span" sx={{ ml: 1 }}>
                    {item.dietary.map(tag => (
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
      {visibleSections.specialRequests && reservation.specialRequests.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
            Special Requests:
          </Typography>
          {reservation.specialRequests.map((request, idx) => (
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

      {/* Financial Info */}
      {visibleSections.financialInfo && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 2,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.05)'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Deposit paid: ${reservation.deposit}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            Total: ${reservation.totalCost}
          </Typography>
        </Box>
      )}
    </Box>
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
              Reservations
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

        {/* Main Reservations Card */}
        <Card sx={{ 
          p: 3, 
          bgcolor: 'background.paper',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}>
          {/* Filters Section */}
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              sx={{
                color: 'text.secondary',
                p: 1,
                justifyContent: 'flex-start',
                width: '100%',
                borderRadius: 1,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
              endIcon={isFilterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              <FilterListIcon sx={{ mr: 1 }} />
              Display Options
            </Button>
            
            {isFilterExpanded && (
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 2,
                bgcolor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 1,
              }}>
                {filterOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={visibleSections[option.key] ? "contained" : "outlined"}
                    size="small"
                    onClick={() => toggleFilter(option.key)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 2,
                      py: 1,
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
                      }
                    }}
                  >
                    <Box sx={{ mr: 1 }}>{option.icon}</Box>
                    {option.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {/* Reservations List */}
          <Stack spacing={2}>
            {reservations.map((reservation, index) => (
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
                    py: 2
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
                        {reservation.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {reservation.name}
                          {reservation.isVip && (
                            <Box 
                              component="span" 
                              sx={{ 
                                ml: 1,
                                color: 'primary.main',
                                fontSize: '0.75rem',
                                bgcolor: 'rgba(144, 202, 249, 0.16)',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              VIP
                            </Box>
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {reservation.time} · {reservation.guests} guests
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Reservation Details */}
                  <ReservationDetails reservation={reservation} />
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default Reservations; 