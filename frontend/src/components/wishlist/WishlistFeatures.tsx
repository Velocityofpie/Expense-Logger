// src/components/wishlist/WishlistFeatures.tsx
import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';

const WishlistFeatures: React.FC = () => {
  // These functions would be implemented in a real app
  const handleEnablePriceTracking = (): void => {
    alert('Price tracking enabled!');
  };
  
  const handleEnableAvailabilityAlerts = (): void => {
    alert('Availability alerts enabled!');
  };
  
  const handleGenerateShareLink = (): void => {
    alert('Link generated: https://example.com/share/wishlist/123456');
  };
  
  const handleExportToCsv = (): void => {
    alert('Wishlist exported to CSV');
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Wishlist Features</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            title="Track Price Changes"
            description="Enable price tracking for your wishlist items and get notified when prices drop."
            actionElement={
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  name="toggle" 
                  id="price-tracking"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  onChange={handleEnablePriceTracking}
                />
                <label 
                  htmlFor="price-tracking" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            }
          />
          
          <FeatureCard
            title="Availability Alerts"
            description="Get notified when out-of-stock items become available again."
            actionElement={
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  name="toggle" 
                  id="availability-alerts"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  onChange={handleEnableAvailabilityAlerts}
                />
                <label 
                  htmlFor="availability-alerts" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            }
          />
          
          <FeatureCard
            title="Share Wishlist"
            description="Create a shareable link to your wishlist."
            actionElement={
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateShareLink}
              >
                Generate Link
              </Button>
            }
          />
          
          <FeatureCard
            title="Export Wishlist"
            description="Export your wishlist to a CSV file."
            actionElement={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToCsv}
              >
                Export to CSV
              </Button>
            }
          />
        </div>
      </CardBody>
    </Card>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  actionElement: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, actionElement }) => {
  return (
    <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 bg-white dark:bg-dark-card">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">{title}</h4>
        {actionElement}
      </div>
      <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{description}</p>
    </div>
  );
};

export default WishlistFeatures;