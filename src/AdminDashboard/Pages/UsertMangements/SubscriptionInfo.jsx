import React from 'react';

const SubscriptionInfo = () => {
  // Sample subscription data
  const currentPlan = {
    name: 'Professional Plan',
    description: 'Full access to all platform features',
    billingCycle: 'Monthly',
    currentPeriod: 'Oct 15, 2025 - Nov 15, 2025',
    nextBillingDate: '15-11-2025',
    amount: '$79.99',
    status: 'Active',
    features: [
      'Up To 50 Clients',
      'Advanced Analytics',
      'Custom Workout Templates',
      'Priority Support',
      'Nutrition Planning Tools',
      'Client Progress Tracking'
    ]
  };

  const subscriptionHistory = [
    {
      plan: 'Professional Plan',
      billingPeriod: 'Oct 15, 2025 - Nov 15, 2025',
      amount: '$79.99',
      status: 'Active'
    },
    {
      plan: 'Basic Plan',
      billingPeriod: 'Oct 1, 2025 - Oct 31, 2025',
      amount: '$29.99',
      status: 'Completed'
    },
    {
      plan: 'Premium Plan',
      billingPeriod: 'Nov 1, 2025 - Dec 1, 2025',
      amount: '$99.99',
      status: 'Completed'
    },
    {
      plan: 'Student Plan',
      billingPeriod: 'Sep 15, 2025 - Oct 15, 2025',
      amount: '$19.99',
      status: 'Completed'
    }
  ];

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
          {status}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-300 text-gray-700 text-xs font-semibold rounded-full">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Plan Section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-6">
          Current Subscription Plan
        </h2>
        
        {/* Blue Plan Box */}
        <div className="bg-[#003F8F] rounded-lg p-6 text-white relative">
          {/* Active Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
              {currentPlan.status}
            </span>
          </div>
          
          {/* Plan Name and Description */}
          <div className="mb-6 pr-20">
            <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
            <p className="text-sm text-blue-100">{currentPlan.description}</p>
          </div>
          
          {/* Billing Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-blue-200 mb-1">Billing Cycle</p>
              <p className="text-sm font-semibold">{currentPlan.billingCycle}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 mb-1">Current Period</p>
              <p className="text-sm font-semibold">{currentPlan.currentPeriod}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 mb-1">Next Billing Date</p>
              <p className="text-sm font-semibold">{currentPlan.nextBillingDate}</p>
            </div>
            <div>
              <p className="text-xs text-blue-200 mb-1">Amount</p>
              <p className="text-sm font-semibold">{currentPlan.amount}</p>
            </div>
          </div>
          
          {/* Plan Features */}
          <div className="border-t border-blue-400 pt-4">
            <p className="text-sm font-semibold mb-3">Plan Features:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription History Section */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
            Subscription History
          </h2>
          <button className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export All Invoices
          </button>
        </div>
        
        {/* Subscription History Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Plan</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Billing Period</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionHistory.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold text-gray-800 font-[Inter]">{item.plan}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600 font-[Inter]">{item.billingPeriod}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold text-gray-800 font-[Inter]">{item.amount}</p>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition cursor-pointer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="24" height="24" rx="4" fill="#003F8F" />
                          <path d="M6.16602 11.9974C6.16602 11.9974 7.91602 7.91406 11.9993 7.91406C16.0827 7.91406 17.8327 11.9974 17.8327 11.9974C17.8327 11.9974 16.0827 16.0807 11.9993 16.0807C7.91602 16.0807 6.16602 11.9974 6.16602 11.9974Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition cursor-pointer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M7 10L12 15L17 10" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 15V3" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionInfo;

