import React from 'react';
import FleetFlowLogo, { FleetFlowLogoProps } from './FleetFlowLogo';

// Backward-compatible alias directing legacy GraceCabsLogo to FleetFlow brand
export const GraceCabsLogo: React.FC<FleetFlowLogoProps> = (props) => {
  return <FleetFlowLogo {...props} />;
};

export default GraceCabsLogo;
