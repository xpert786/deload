import React, { useState } from 'react';

const SubscriptionInfo = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Sample invoice data
  const invoiceData = {
    invoiceNumber: '#INV-001',
    issueDate: 'Oct 15, 2025',
    dueDate: 'Nov 15, 2025',
    billedTo: {
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      phone: '+1 (555) 123-4567'
    },
    company: {
      name: 'Deload Fitness',
      address: '123 Fitness Street',
      city: 'San Francisco, CA 94102',
      email: 'billing@deloadfitness.com'
    },
    plan: 'Professional Plan',
    billingCycle: 'Monthly',
    status: 'Paid',
    items: [
      {
        description: 'Professional Plan Subscription',
        quantity: 1,
        unitPrice: '$79.99',
        amount: '$79.99'
      }
    ],
    subtotal: '$79.99',
    tax: '$0.00',
    taxPercent: '0%',
    discount: '$0.00',
    total: '$79.99'
  };
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
        <div className="bg-[#035ED2] rounded-lg p-6 text-white relative">
          {/* Active Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
              {currentPlan.status}
            </span>
          </div>

          {/* Plan Name and Description */}
          <div className="mb-6 pr-20">
            <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
            <p className="text-sm text-[#FFFFFF]">{currentPlan.description}</p>
          </div>

          {/* Billing Details - Horizontal Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-[#DFDFDF] mb-1">Billing Cycle</p>
              <p className="text-sm font-semibold text-white">{currentPlan.billingCycle}</p>
            </div>
            <div>
              <p className="text-xs text-[#DFDFDF] mb-1">Current Period</p>
              <p className="text-sm font-semibold text-white">{currentPlan.currentPeriod}</p>
            </div>
            <div>
              <p className="text-xs text-[#DFDFDF] mb-1">Next Billing Date</p>
              <p className="text-sm font-semibold text-white">{currentPlan.nextBillingDate}</p>
            </div>
            <div>
              <p className="text-xs text-[#DFDFDF] mb-1">Amount</p>
              <p className="text-sm font-semibold text-white">{currentPlan.amount}</p>
            </div>
          </div>

          {/* Plan Features - Vertical List */}
          <div className="pt-4">
            <p className="text-lg font-semibold mb-3">Plan Features:</p>
            <div className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.9063 5.46878C8.5938 7.03128 7.41574 8.5023 5.76212 8.83123C4.10851 9.16016 2.43046 8.39098 1.60023 6.92354C0.769998 5.45614 0.974961 3.62162 2.10858 2.37361C3.2422 1.12559 5.1563 0.781289 6.7188 1.40629" stroke="#F3701E" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3.59375 4.84375L5.15625 6.40625L8.90625 2.34375" stroke="#F3701E" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>

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
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition flex items-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export All Invoices
          </button>
        </div>

        {/* Column Headers */}
        <div className="hidden sm:grid sm:grid-cols-[160px_1fr_110px_130px_140px] gap-6 px-6 py-3 rounded-t-lg ">
          <div>
            <p className="text-[16px] font-semibold text-[#4B5563] font-[Inter]">Plan</p>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#4B5563] font-[Inter]">Billing Period</p>
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#4B5563] font-[Inter]">Amount</p>
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#4B5563] font-[Inter]">Status</p>
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#4B5563] font-[Inter]">Invoice</p>
          </div>
        </div>

        {/* Subscription History Cards */}
        <div className="space-y-4">
          {subscriptionHistory.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[160px_1fr_110px_130px_140px] gap-6 items-center px-6 py-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              {/* Plan Name */}
              <div>
                <p className="text-xs text-gray-600 font-[Inter] mb-1 sm:hidden">Plan</p>
                <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{item.plan}</p>
              </div>

              {/* Billing Period */}
              <div className="sm:text-center">
                <p className="text-xs text-gray-600 font-[Inter] mb-1 sm:hidden">Billing Period</p>
                <p className="text-sm text-[#003F8F] font-semibold font-[Inter] text-left sm:text-center">{item.billingPeriod}</p>
              </div>

              {/* Amount */}
              <div>
                <p className="text-xs text-gray-600 font-[Inter] mb-1 sm:hidden">Amount</p>
                <p className="text-sm font-semibold text-[#003F8F] font-[Inter]">{item.amount}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-gray-600 font-[Inter] mb-1 sm:hidden">Status</p>
                {getStatusBadge(item.status)}
              </div>

              {/* Action Icons */}
              <div>
                <p className="text-xs text-gray-600 font-[Inter] mb-1 sm:hidden">Invoice</p>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg border border-gray-300 transition cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg border border-gray-300 transition cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 10L12 15L17 10" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 15V3" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">Invoice Details</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#4D6080" fill-opacity="0.8" />
                  <path d="M16.067 8.99502C16.1386 8.92587 16.1958 8.84314 16.2352 8.75165C16.2745 8.66017 16.2952 8.56176 16.2962 8.46218C16.2971 8.3626 16.2781 8.26383 16.2405 8.17164C16.2028 8.07945 16.1472 7.99568 16.0768 7.92523C16.0064 7.85478 15.9227 7.79905 15.8305 7.7613C15.7384 7.72354 15.6396 7.70452 15.54 7.70534C15.4404 7.70616 15.342 7.7268 15.2505 7.76606C15.159 7.80532 15.0762 7.86242 15.007 7.93402L12.001 10.939L8.99597 7.93402C8.92731 7.86033 8.84451 7.80123 8.75251 7.76024C8.66051 7.71925 8.5612 7.69721 8.4605 7.69543C8.35979 7.69365 8.25976 7.71218 8.16638 7.7499C8.07299 7.78762 7.98815 7.84376 7.91694 7.91498C7.84572 7.9862 7.78957 8.07103 7.75185 8.16442C7.71413 8.25781 7.69561 8.35784 7.69738 8.45854C7.69916 8.55925 7.7212 8.65856 7.76219 8.75056C7.80319 8.84256 7.86229 8.92536 7.93597 8.99402L10.939 12L7.93397 15.005C7.80149 15.1472 7.72937 15.3352 7.7328 15.5295C7.73623 15.7238 7.81494 15.9092 7.95235 16.0466C8.08977 16.1841 8.27515 16.2628 8.46945 16.2662C8.66375 16.2696 8.8518 16.1975 8.99397 16.065L12.001 13.06L15.006 16.066C15.1481 16.1985 15.3362 16.2706 15.5305 16.2672C15.7248 16.2638 15.9102 16.1851 16.0476 16.0476C16.185 15.9102 16.2637 15.7248 16.2671 15.5305C16.2706 15.3362 16.1985 15.1482 16.066 15.006L13.063 12L16.067 8.99502Z" fill="white" />
                </svg>

              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Top Section: Invoice Info and Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Invoice Info and Bill To */}
                <div className="space-y-6">
                  {/* Invoice Information */}
                  <div>
                    <h3 className="text-lg font-bold text-[#003F8F] font-[Inter] mb-3">INVOICE</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-[Inter]">
                        <span className="font-semibold text-[#003F8F]">Invoice:</span> {invoiceData.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600 font-[Inter]">
                        <span className="font-semibold text-[#003F8F]">Issue Date:</span> {invoiceData.issueDate}
                      </p>
                      <p className="text-sm text-gray-600 font-[Inter]">
                        <span className="font-semibold text-[#003F8F]">Due Date:</span> {invoiceData.dueDate}
                      </p>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div>
                    <h3 className="text-sm font-bold text-[#003F8F] font-[Inter] mb-3">Bill To:</h3>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#003F8F] font-[Inter]">{invoiceData.billedTo.name}</p>
                      <p className="text-sm text-gray-600 font-[Inter]">{invoiceData.billedTo.email}</p>
                      <p className="text-sm text-gray-600 font-[Inter]">{invoiceData.billedTo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Company Info and Plan Details */}
                <div className="space-y-6 md:text-right">
                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-bold text-[#003F8F] font-[Inter] mb-3">Deload Fitness</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-800 font-[Inter]">{invoiceData.company.address}</p>
                      <p className="text-sm text-gray-800 font-[Inter]">{invoiceData.company.city}</p>
                      <p className="text-sm text-gray-600 font-[Inter]">{invoiceData.company.email}</p>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div>

                    <div className="space-y-2 md:text-right">
                      <p className="text-sm text-gray-600 font-[Inter]">
                        <span className="font-semibold text-[#003F8F]">Plan:</span> <span className='ml-3'>{invoiceData.plan}</span>
                      </p>
                      <p className="text-sm text-gray-600 font-[Inter]">
                        <span className="font-semibold text-[#003F8F]">Billing Cycle:</span> <span className='ml-3'>{invoiceData.billingCycle}</span>
                      </p>
                      <p className="text-sm text-gray-600 font-[Inter]">
                        <span className="font-semibold text-[#003F8F]">Status:</span>{' '}
                        <span className="text-[#10B981] font-semibold">
                          <span className='ml-3'>{invoiceData.status}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-gray-200 pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#003F8F] font-[Inter]">Description</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-[#003F8F] font-[Inter]">Quantity</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[#003F8F] font-[Inter]">Unit Price</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-[#003F8F] font-[Inter]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 ">
                          <td className="py-3 px-4 text-sm  font-[Inter] text-[#003F8F]">{item.description}</td>
                          <td className="py-3 px-4 text-sm  font-[Inter] text-center text-[#003F8F]">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm  font-[Inter] text-right text-[#003F8F]">{item.unitPrice}</td>
                          <td className="py-3 px-4 text-sm  font-[Inter] text-right text-[#003F8F]">{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Section */}
              <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-3">
                  <div className="flex justify-between text-sm  font-[Inter] ml-31">
                    <span className='text-[#4D6080CC]'>Subtotal:</span>
                    <span className='text-[#003F8F]'>{invoiceData.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-[Inter] ml-31">
                    <span className='text-[#4D6080CC]'>Tax ({invoiceData.taxPercent}):</span>
                    <span className='text-[#003F8F]'>{invoiceData.tax}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-[Inter] ml-31">
                    <span className='text-[#4D6080CC]'>Discount:</span>
                    <span className='text-[#003F8F]'>{invoiceData.discount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#003F8F] font-[Inter] pt-3 border-t border-gray-200 ml-31">
                    <span className='text-[#003F8F]'>Total:</span>
                    <span className='text-[#003F8F]'>{invoiceData.total}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 justify-end">
                <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-[#4D6080CC] hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer bg-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9V2H18V9" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 14H18V22H6V14Z" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Print Invoice
                </button>
                <button className="px-6 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition flex items-center justify-center gap-2 cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;

