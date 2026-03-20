import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import EmailStatusMonitor from './EmailStatusMonitor';
import EmailHistory from './EmailHistory';

const EmailStatusDashboard = ({ 
  defaultView = 'history',
  showMonitor = true,
  showHistory = true
}) => {
  const [tab, setTab] = useState(defaultView === 'monitor' ? 0 : 1);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const availableTabs = [];

  if (showMonitor) {
    availableTabs.push('Monitor');
  }

  if (showHistory) {
    availableTabs.push('History');
  }

  return (
    <Box className="space-y-4">
      {availableTabs.length > 1 && (
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          {availableTabs.map((tabName) => (
            <Tab key={tabName} label={tabName} />
          ))}
        </Tabs>
      )}

      <Box className="mt-4">
        {showMonitor && tab === 0 && (
          <Box>
            <h3 className="text-lg font-semibold mb-4">Email Delivery Monitor</h3>
            <EmailStatusMonitor 
              jobId={null}
              autoRefresh={false}
            />
          </Box>
        )}

        {showHistory && tab === (showMonitor ? 1 : 0) && (
          <Box>
            <h3 className="text-lg font-semibold mb-4">Email History</h3>
            <EmailHistory />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EmailStatusDashboard;