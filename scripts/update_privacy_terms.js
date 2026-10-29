const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/Privacy Policy - Grace Cabs/g, 'Privacy Policy - FleetFlow');
  content = content.replace(/Terms &amp; Conditions - Grace Cabs/g, 'Terms &amp; Conditions - FleetFlow');
  content = content.replace(/\/images\/GRACELOGO\.jpg/g, '/images/fleetflow_logo.svg');
  content = content.replace(/alt="Grace Cabs"/g, 'alt="FleetFlow"');
  content = content.replace(/Grace Cabs Private Limited/g, 'FleetFlow Mobility Platform');
  content = content.replace(/Grace Cabs/g, 'FleetFlow');
  content = content.replace(/#003366/g, '#5B3DF5');
  content = content.replace(/2025/g, '2026');
  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('d:/demobooking/demo-bookings/frontend/public/PrivacyPolicy.html');
updateFile('d:/demobooking/demo-bookings/frontend/public/TermsAndConditions.html');
console.log('Static legal HTML files updated successfully');
