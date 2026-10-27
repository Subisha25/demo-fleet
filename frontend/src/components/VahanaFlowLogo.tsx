import React from 'react';
import FleetFlowLogo, { FleetFlowLogoProps } from './FleetFlowLogo';

export type VahanaFlowLogoProps = FleetFlowLogoProps;

export const VahanaFlowLogo: React.FC<VahanaFlowLogoProps> = (props) => {
  return <FleetFlowLogo {...props} />;
};

export default VahanaFlowLogo;
