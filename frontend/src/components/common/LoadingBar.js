import React from 'react';
import { LinearProgress, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 2,
  background: theme.palette.mode === 'light' 
    ? 'rgba(212, 175, 55, 0.2)'  // Gold with opacity
    : 'rgba(255, 215, 0, 0.1)',  // Darker gold with opacity
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(
      90deg,
      ${theme.palette.primary.main} 0%,
      ${theme.palette.primary.light} 50%,
      ${theme.palette.primary.main} 100%
    )`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s infinite linear`,
  },
}));

const LoadingBarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 1,
  '& .MuiLinearProgress-root': {
    transition: 'transform 0.2s ease-in-out',
    transform: 'scaleY(1)',
  },
  '&.hidden .MuiLinearProgress-root': {
    transform: 'scaleY(0)',
  },
}));

const LoadingBar = ({ loading = false }) => {
  return (
    <LoadingBarContainer className={!loading ? 'hidden' : ''}>
      <StyledLinearProgress />
    </LoadingBarContainer>
  );
};

export default LoadingBar; 