import React from 'react';
import { FaCalendar } from 'react-icons/fa';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

const HomeOwnerDashboard: React.FC = () => {
  useDocumentTitle('Dashboard');

  return (
    <>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Upcoming Appointments', value: '3', color: 'blue' },
          { label: 'Completed Services', value: '12', color: 'green' },
          { label: 'Active Requests', value: '2', color: 'purple' }
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm font-medium mb-2">{label}</h3>
            <p className="text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Recent Services</h2>
        <div className="space-y-4">
          {[
            { service: 'Plumbing Repair', provider: 'John Smith', date: 'March 15, 2024' },
            { service: 'Electrical Maintenance', provider: 'Maria Garcia', date: 'March 12, 2024' }
          ].map(({ service, provider, date }, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FaCalendar className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{service}</h3>
                  <p className="text-sm text-gray-500">{provider} - {date}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                Scheduled
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeOwnerDashboard;
