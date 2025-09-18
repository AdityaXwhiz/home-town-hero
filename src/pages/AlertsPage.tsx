import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, Info, UserCircle } from 'lucide-react';

// Mock user data - in a real app, this would come from your authentication context
const currentUser = {
  name: 'Aditya',
};

// Mock alert data - added a few more to show the grid
const mockAlerts = [
  {
    id: 1,
    type: 'welcome',
    title: `Welcome, ${currentUser.name}!`,
    message: 'We are glad to have you here. Start making a difference in your community today by reporting issues or joining discussions.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'resolved',
    title: 'Pothole Report Resolved!',
    message: 'The pothole you reported on Elm Street has been successfully repaired. Thank you for your contribution!',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'update',
    title: 'Streetlight Issue In Progress',
    message: 'Your report regarding the broken streetlight on Oak Avenue has been assigned to a technician.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'update',
    title: 'New Comment on Your Report',
    message: 'A fellow citizen has commented on your "Overflowing Bin" report. Join the conversation!',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    type: 'resolved',
    title: 'Graffiti Cleaned Up',
    message: 'The graffiti issue you highlighted near the community park has been addressed. The wall is now clean.',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    type: 'update',
    title: 'Community Meeting Reminder',
    message: 'Just a reminder about the neighborhood watch meeting this Friday. Your presence is valuable!',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to get the right icon and color for each alert type
const getAlertStyle = (type: string) => {
  switch (type) {
    case 'welcome':
      return { icon: <UserCircle className="h-6 w-6 text-blue-500" />, color: 'border-blue-500' };
    case 'resolved':
      return { icon: <CheckCircle className="h-6 w-6 text-green-500" />, color: 'border-green-500' };
    case 'update':
      return { icon: <Info className="h-6 w-6 text-yellow-500" />, color: 'border-yellow-500' };
    default:
      return { icon: <Bell className="h-6 w-6 text-gray-500" />, color: 'border-gray-500' };
  }
};

const AlertsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Alerts & Notifications</h2>
      
      {/* Changed from a single column to a responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAlerts.map(alert => {
          const { icon, color } = getAlertStyle(alert.type);
          return (
            <Card key={alert.id} className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${color} flex flex-col`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{icon}</div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow"> {/* flex-grow ensures cards in the same row have equal height */}
                <p className="text-gray-700 pl-10">{alert.message}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPage;

