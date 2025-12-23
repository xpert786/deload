import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const BillingSubscriptions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Form state for Add Plan Modal
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    monthly_price: '',
    yearly_price: '',
    max_clients: '',
    max_users: '1',
    storage_limit_gb: '',
    features: [],
    stripe_monthly_price_id: '',
    stripe_yearly_price_id: '',
    is_active: true
  });
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');
  const [planSuccess, setPlanSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // State for subscription plans from API
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState('');

  // Ref for scrollable container
  const plansScrollRef = useRef(null);

  const itemsPerPage = 3;

  // Scroll functions for plans carousel
  const scrollPlansLeft = () => {
    if (plansScrollRef.current) {
      const containerWidth = plansScrollRef.current.offsetWidth;
      plansScrollRef.current.scrollBy({
        left: -containerWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollPlansRight = () => {
    if (plansScrollRef.current) {
      const containerWidth = plansScrollRef.current.offsetWidth;
      plansScrollRef.current.scrollBy({
        left: containerWidth,
        behavior: 'smooth'
      });
    }
  };

  // Key Metrics Data
  const keyMetrics = {
    monthlyRevenue: '$12,480',
    activeSubscriptions: 72,
    averageRevenuePerUser: '$145.12'
  };

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

  // Subscription Distribution Data (Donut Chart)
  const subscriptionDistribution = [
    { name: 'Basic Plan', value: 20, color: '#10B981' },
    { name: 'Enterprise Plan', value: 7, color: '#EF4444' },
    { name: 'Professional Plan', value: 45, color: '#003F8F' },

  ];

  // Revenue Overview Data (Line Chart)
  const revenueData = [
    { month: 'Jan', revenue: 1500 },
    { month: 'Feb', revenue: 3500 },
    { month: 'Mar', revenue: 3000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 5500 },
    { month: 'Jun', revenue: 6000 },
    { month: 'Jul', revenue: 7000 },
    { month: 'Aug', revenue: 7500 }
  ];

  // Function to map API features to display-friendly strings
  const mapFeatureToDisplay = (feature) => {
    const featureMap = {
      'advanced_workout_builder': 'Advanced workout builder',
      'custom_branding': 'Custom branding',
      'priority_support': 'Priority support',
      'advanced_analytics': 'Advanced analytics'
    };
    return featureMap[feature] || feature;
  };

  // Function to fetch subscription plans from API
  const fetchSubscriptionPlans = async () => {
    setPlansLoading(true);
    setPlansError('');

    try {
      // Get authentication token
      const storedUser = localStorage.getItem('user');
      let token = null;

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/plan-list/`
        : `${baseUrl}/api/plan-list/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });

      let result;
      try {
        const responseText = await response.text();
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        // Map API response to UI format
        const mappedPlans = result.data.map((plan) => {
          // Map features array to display strings
          const displayFeatures = plan.features.map(mapFeatureToDisplay);
          
          // Add additional features based on plan data
          const features = [
            ...displayFeatures,
            `Up to ${plan.max_clients} clients`
          ];

          return {
            id: plan.id,
            name: plan.name,
            price: `$${parseFloat(plan.monthly_price).toFixed(2)}`,
            period: 'per month',
            features: features,
            checkmarkColor: '#F4721E', // Default checkmark color
            originalData: plan // Keep original data for reference
          };
        });

        setSubscriptionPlans(mappedPlans);
        console.log('Plans fetched successfully:', mappedPlans);
      } else {
        const errorMessage = result.message || result.detail || result.error || 'Failed to fetch subscription plans';
        setPlansError(errorMessage);
        console.error('Failed to fetch plans:', errorMessage);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setPlansError(err.message || 'Failed to fetch subscription plans. Please try again.');
    } finally {
      setPlansLoading(false);
    }
  };

  // Fetch plans on component mount
  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  // Recent Transactions Data
  const recentTransactions = [
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Professional',
      planColor: '#003F8F',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Basic Plan',
      planColor: '#EF4444',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Enterprise Plan',
      planColor: '#10B981',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Professional',
      planColor: '#003F8F',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Basic Plan',
      planColor: '#EF4444',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Enterprise Plan',
      planColor: '#10B981',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Professional',
      planColor: '#003F8F',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Basic Plan',
      planColor: '#EF4444',
      status: 'Active'
    },
    {
      transactionId: 'txn_789012',
      user: 'Michael Johnson',
      date: 'Oct 15, 2025',
      amount: '$79.99',
      plan: 'Enterprise Plan',
      planColor: '#10B981',
      status: 'Active'
    }
  ];

  // Pagination
  const totalPages = Math.ceil(recentTransactions.length / itemsPerPage);
  const paginatedTransactions = recentTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Validate Plan Form
  const validatePlanForm = () => {
    const errors = {};

    if (!planFormData.name || planFormData.name.trim() === '') {
      errors.name = 'Plan Name is required';
    }

    if (!planFormData.monthly_price || planFormData.monthly_price.trim() === '') {
      errors.monthly_price = 'Monthly Price is required';
    } else if (isNaN(parseFloat(planFormData.monthly_price)) || parseFloat(planFormData.monthly_price) <= 0) {
      errors.monthly_price = 'Monthly Price must be a valid positive number';
    }

    if (!planFormData.max_clients || planFormData.max_clients.trim() === '') {
      errors.max_clients = 'Maximum Clients is required';
    } else if (isNaN(parseInt(planFormData.max_clients)) || parseInt(planFormData.max_clients) < 1) {
      errors.max_clients = 'Maximum Clients must be at least 1';
    }

    if (!planFormData.features || planFormData.features.length === 0) {
      errors.features = 'At least one feature must be selected';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Create Plan
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setPlanError('');
    setPlanSuccess(false);
    
    // Validate form
    if (!validatePlanForm()) {
      return;
    }
    
    setPlanLoading(true);

    try {
      // Get authentication token
      const storedUser = localStorage.getItem('user');
      let token = null;

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/plans/`
        : `${baseUrl}/api/plans/`;

      // Prepare request body - set defaults for hidden fields
      const requestBody = {
        name: planFormData.name,
        description: planFormData.description || '',
        monthly_price: planFormData.monthly_price,
        yearly_price: planFormData.yearly_price || (parseFloat(planFormData.monthly_price) * 12).toFixed(2),
        max_clients: parseInt(planFormData.max_clients) || 10,
        max_users: parseInt(planFormData.max_users) || 1,
        storage_limit_gb: parseInt(planFormData.storage_limit_gb) || 5,
        features: planFormData.features,
        is_active: planFormData.is_active
      };

      // Add optional Stripe price IDs if provided
      if (planFormData.stripe_monthly_price_id) {
        requestBody.stripe_monthly_price_id = planFormData.stripe_monthly_price_id;
      }
      if (planFormData.stripe_yearly_price_id) {
        requestBody.stripe_yearly_price_id = planFormData.stripe_yearly_price_id;
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      console.log('Creating plan:', requestBody);
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      let result;
      try {
        const responseText = await response.text();
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        console.log('Plan created successfully:', result);
        setPlanSuccess(true);
        setPlanError('');
        // Refresh plans list
        fetchSubscriptionPlans();
        // Reset form after 3 seconds and close modal (don't reload page)
        setTimeout(() => {
          setShowAddPlanModal(false);
          setPlanSuccess(false);
          setValidationErrors({});
          setPlanFormData({
            name: '',
            description: '',
            monthly_price: '',
            yearly_price: '',
            max_clients: '',
            max_users: '1',
            storage_limit_gb: '',
            features: [],
            stripe_monthly_price_id: '',
            stripe_yearly_price_id: '',
            is_active: true
          });
        }, 3000);
      } else {
        // Handle API validation errors
        const apiErrors = {};
        
        // Field name mapping (API field names to form field names)
        const fieldMapping = {
          'monthly_price': 'monthly_price',
          'max_clients': 'max_clients',
          'plan_name': 'name',
          'name': 'name'
        };
        
        // Check for field-specific validation errors in result.errors
        if (result.errors && typeof result.errors === 'object') {
          Object.keys(result.errors).forEach((field) => {
            const mappedField = fieldMapping[field] || field;
            const fieldErrors = result.errors[field];
            if (Array.isArray(fieldErrors)) {
              apiErrors[mappedField] = fieldErrors[0]; // Take first error message
            } else if (typeof fieldErrors === 'string') {
              apiErrors[mappedField] = fieldErrors;
            }
          });
        }
        
        // Check for direct field errors in response (non-standard format)
        Object.keys(result).forEach((key) => {
          if (key !== 'message' && key !== 'detail' && key !== 'error' && key !== 'errors' && key !== 'success' && key !== 'data') {
            const mappedField = fieldMapping[key] || key;
            const fieldValue = result[key];
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              apiErrors[mappedField] = fieldValue[0];
            } else if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
              apiErrors[mappedField] = fieldValue;
            }
          }
        });
        
        if (Object.keys(apiErrors).length > 0) {
          setValidationErrors(apiErrors);
        }
        
        const errorMessage = result.message || result.detail || result.error || 'Failed to create subscription plan';
        setPlanError(errorMessage);
        console.error('Failed to create plan:', errorMessage, apiErrors);
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      setPlanError(err.message || 'Failed to create subscription plan. Please try again.');
    } finally {
      setPlanLoading(false);
    }
  };

  // Handle Edit Plan - Open modal with plan data
  const handleOpenEditPlan = (plan) => {
    if (plan.originalData) {
      const originalPlan = plan.originalData;
      setEditingPlanId(originalPlan.id);
      setPlanFormData({
        name: originalPlan.name || '',
        description: originalPlan.description || '',
        monthly_price: originalPlan.monthly_price || '',
        yearly_price: originalPlan.yearly_price || '',
        max_clients: originalPlan.max_clients?.toString() || '',
        max_users: originalPlan.max_users?.toString() || '1',
        storage_limit_gb: originalPlan.storage_limit_gb?.toString() || '',
        features: originalPlan.features || [],
        stripe_monthly_price_id: originalPlan.stripe_monthly_price_id || '',
        stripe_yearly_price_id: originalPlan.stripe_yearly_price_id || '',
        is_active: originalPlan.is_active !== undefined ? originalPlan.is_active : true
      });
      setPlanError('');
      setPlanSuccess(false);
      setValidationErrors({});
      setShowEditPlanModal(true);
    }
  };

  // Handle Update Plan
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    if (!editingPlanId) return;

    setPlanError('');
    setPlanSuccess(false);
    
    // Validate form
    if (!validatePlanForm()) {
      return;
    }
    
    setPlanLoading(true);

    try {
      // Get authentication token
      const storedUser = localStorage.getItem('user');
      let token = null;

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      // Check if baseUrl already includes /api, if not add it
      const apiUrl = baseUrl.includes('/api')
        ? `${baseUrl}/plan-update/${editingPlanId}/`
        : `${baseUrl}/api/plan-update/${editingPlanId}/`;

      // Prepare request body
      const requestBody = {
        name: planFormData.name,
        description: planFormData.description || '',
        monthly_price: planFormData.monthly_price,
        yearly_price: planFormData.yearly_price || (parseFloat(planFormData.monthly_price) * 12).toFixed(2),
        max_clients: parseInt(planFormData.max_clients) || 10,
        max_users: parseInt(planFormData.max_users) || 1,
        storage_limit_gb: parseInt(planFormData.storage_limit_gb) || 5,
        features: planFormData.features,
        is_active: planFormData.is_active
      };

      // Add optional Stripe price IDs if provided
      if (planFormData.stripe_monthly_price_id) {
        requestBody.stripe_monthly_price_id = planFormData.stripe_monthly_price_id;
      }
      if (planFormData.stripe_yearly_price_id) {
        requestBody.stripe_yearly_price_id = planFormData.stripe_yearly_price_id;
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      console.log('Updating plan:', requestBody);
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      let result;
      try {
        const responseText = await response.text();
        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          result = {};
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse server response');
      }

      if (response.ok) {
        console.log('Plan updated successfully:', result);
        setPlanSuccess(true);
        setPlanError('');
        // Refresh plans list
        fetchSubscriptionPlans();
        // Reset form after 3 seconds and close modal
        setTimeout(() => {
          setShowEditPlanModal(false);
          setEditingPlanId(null);
          setPlanSuccess(false);
          setValidationErrors({});
          setPlanFormData({
            name: '',
            description: '',
            monthly_price: '',
            yearly_price: '',
            max_clients: '',
            max_users: '1',
            storage_limit_gb: '',
            features: [],
            stripe_monthly_price_id: '',
            stripe_yearly_price_id: '',
            is_active: true
          });
        }, 3000);
      } else {
        // Handle API validation errors
        const apiErrors = {};
        
        // Field name mapping (API field names to form field names)
        const fieldMapping = {
          'monthly_price': 'monthly_price',
          'max_clients': 'max_clients',
          'plan_name': 'name',
          'name': 'name'
        };
        
        // Check for field-specific validation errors in result.errors
        if (result.errors && typeof result.errors === 'object') {
          Object.keys(result.errors).forEach((field) => {
            const mappedField = fieldMapping[field] || field;
            const fieldErrors = result.errors[field];
            if (Array.isArray(fieldErrors)) {
              apiErrors[mappedField] = fieldErrors[0]; // Take first error message
            } else if (typeof fieldErrors === 'string') {
              apiErrors[mappedField] = fieldErrors;
            }
          });
        }
        
        // Check for direct field errors in response (non-standard format)
        Object.keys(result).forEach((key) => {
          if (key !== 'message' && key !== 'detail' && key !== 'error' && key !== 'errors' && key !== 'success' && key !== 'data') {
            const mappedField = fieldMapping[key] || key;
            const fieldValue = result[key];
            if (Array.isArray(fieldValue) && fieldValue.length > 0) {
              apiErrors[mappedField] = fieldValue[0];
            } else if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
              apiErrors[mappedField] = fieldValue;
            }
          }
        });
        
        if (Object.keys(apiErrors).length > 0) {
          setValidationErrors(apiErrors);
        }
        
        const errorMessage = result.message || result.detail || result.error || 'Failed to update subscription plan';
        setPlanError(errorMessage);
        console.error('Failed to update plan:', errorMessage, apiErrors);
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      setPlanError(err.message || 'Failed to update subscription plan. Please try again.');
    } finally {
      setPlanLoading(false);
    }
  };

  // Calculate total for donut chart
  const total = subscriptionDistribution.reduce((sum, item) => sum + item.value, 0);
  const radius = 60;
  const centerX = 80;
  const centerY = 80;

  const createArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const start = {
      x: centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180)
    };
    const end = {
      x: centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180)
    };
    const startInner = {
      x: centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180)
    };
    const endInner = {
      x: centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180)
    };
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L ${startInner.x} ${startInner.y} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y} Z`;
  };

  let currentAngle = -90;
  const chartSegments = subscriptionDistribution.map(item => {
    const percent = (item.value / total) * 100;
    const angle = (percent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percent,
      path: createArcPath(startAngle, endAngle, 40, radius)
    };
  });

  return (
    <div className="space-y-6 p-4 sm:p-4 bg-[#F7F7F7] min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg    sm:p-6 mb-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
          Billing & Subscriptions
        </h1>

        <p className="text-sm sm:text-base text-[#4D6080CC] font-[Inter] mt-2">
          Manage Stripe integration, subscription plans, and payment settings
        </p>
      </div>


      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-[Inter]">Monthly Revenue</p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#035ED2" stroke-width="1.5" />
              <path d="M12 6V18M15 9.5C15 8.12 13.657 7 12 7C10.343 7 9 8.12 9 9.5C9 10.88 10.343 12 12 12C13.657 12 15 13.12 15 14.5C15 15.88 13.657 17 12 17C10.343 17 9 15.88 9 14.5" stroke="#035ED2" stroke-width="1.5" stroke-linecap="round" />
            </svg>

          </div>
          <p className="text-xl sm:text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
            {keyMetrics.monthlyRevenue}
          </p>
        </div>

        {/* Active Subscription */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-[Inter]">Active Subscription</p>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.01074 1.72644C7.55107 1.44674 8.138 1.38748 8.7168 1.43347C10.8038 1.60129 12.6799 2.32057 14.2812 3.69324C14.9723 4.28618 15.4945 5.01166 15.7275 5.91687C15.9949 6.95722 15.7662 7.91955 15.2217 8.80359C15.0068 9.15234 14.7542 9.48242 14.4824 9.78699C14.3284 9.95961 14.2607 10.132 14.2432 10.3553C14.1635 11.3727 13.8249 12.3004 13.2129 13.12C13.0377 13.3543 12.8371 13.5721 12.625 13.7714C12.5741 13.819 12.5488 13.8609 12.5361 13.9022C12.5231 13.9451 12.5206 13.996 12.5283 14.0653L12.5615 14.2714C12.6597 14.7379 12.9063 15.105 13.333 15.3505C13.6335 15.5236 13.946 15.6691 14.2783 15.8329C14.263 12.5498 17.17 9.85733 20.5479 10.2567C23.6999 10.6289 25.8495 13.3552 25.4824 16.5057C25.127 19.5498 22.4299 21.6715 19.3916 21.4139C19.3917 22.2384 19.3923 23.0472 19.3916 23.8563C19.3916 23.9893 19.3858 24.1024 19.3662 24.1962C19.3463 24.2911 19.3106 24.3735 19.248 24.4374C19.1853 24.5013 19.1044 24.5371 19.0107 24.5575C18.9181 24.5777 18.8065 24.5848 18.6758 24.5848H1.15918C1.03104 24.5848 0.921712 24.5787 0.831055 24.5594C0.739107 24.5399 0.659549 24.5045 0.597656 24.4423C0.535813 24.38 0.500823 24.3001 0.481445 24.2079C0.46233 24.1168 0.457031 24.0068 0.457031 23.8778C0.457031 23.1196 0.445679 22.3555 0.461914 21.5946C0.481184 20.6584 0.639625 19.7423 1.05176 18.8807C1.64474 17.6414 2.67673 16.9144 3.89648 16.4325C4.21103 16.3083 4.52974 16.1935 4.8457 16.078C5.16225 15.9623 5.47678 15.8457 5.78613 15.7186C6.09618 15.5911 6.3977 15.4257 6.67285 15.2333C7.10183 14.9337 7.29467 14.4923 7.30273 13.9637C7.30311 13.9426 7.29674 13.9117 7.28223 13.8788C7.27503 13.8625 7.26654 13.8477 7.25781 13.8348L7.23145 13.8026C6.19322 12.8183 5.67818 11.5972 5.57227 10.1903C5.56947 10.1541 5.55395 10.1112 5.52734 10.0624C5.5011 10.0143 5.46694 9.96628 5.43164 9.92078V9.9198C4.6639 8.92496 4.19033 7.81021 4.14355 6.53894C4.1182 5.85978 4.27961 5.25478 4.61328 4.74695C4.9467 4.23956 5.44856 3.8342 6.09668 3.54773H6.09766C6.15946 3.52072 6.22044 3.49213 6.28516 3.46277L6.23242 3.07507C6.20964 2.76734 6.26796 2.49825 6.40332 2.27039C6.53836 2.04307 6.74615 1.86336 7.01074 1.72644ZM13.1299 16.4481C12.3374 17.5051 11.2519 18.0601 9.90918 18.0594C8.56638 18.0587 7.4858 17.4913 6.70898 16.4598C5.88141 16.771 5.08505 17.0708 4.28809 17.371C2.7796 17.9384 1.7957 18.9627 1.59473 20.5751C1.4729 21.5545 1.50548 22.5464 1.47461 23.5507H4.46777V22.746C4.46777 22.1721 4.46664 21.5968 4.46875 21.0223C4.46919 20.8428 4.51282 20.6859 4.60254 20.5721C4.69443 20.4558 4.82752 20.3931 4.9834 20.3934C5.13883 20.3939 5.27026 20.4538 5.36035 20.5712C5.44734 20.6847 5.48813 20.8419 5.49121 21.0243V23.5526H14.3486L14.3496 20.9774C14.35 20.814 14.3954 20.6692 14.4844 20.5634C14.5747 20.456 14.7043 20.3957 14.8525 20.3944C15.0015 20.3932 15.1313 20.451 15.2227 20.5575C15.3126 20.6624 15.3585 20.8066 15.3594 20.9706V20.9716C15.3615 21.774 15.3604 22.5758 15.3604 23.3778V23.5585C16.3667 23.5591 17.3473 23.5585 18.3486 23.5585C18.349 22.7872 18.3536 22.0377 18.3408 21.288C18.3409 21.2941 18.3424 21.2918 18.335 21.2792C18.3282 21.2677 18.3175 21.2532 18.3027 21.2382C18.2871 21.2223 18.2697 21.2089 18.2539 21.1981L18.2129 21.1757C16.2298 20.4804 14.978 19.1109 14.4482 17.0809C14.4411 17.0536 14.4239 17.0186 14.4004 16.9872C14.376 16.9546 14.352 16.9359 14.3369 16.9296V16.9286C13.9437 16.7605 13.5443 16.6102 13.1299 16.4481ZM19.9736 11.243C17.4093 11.2224 15.3447 13.2571 15.3281 15.8192C15.3125 18.3189 17.3633 20.3957 19.876 20.4227C22.4072 20.4496 24.4839 18.3982 24.5039 15.8495C24.5237 13.3275 22.4927 11.2623 19.9736 11.243ZM11.5635 14.496C10.4562 14.9728 9.36428 14.9611 8.29102 14.5116C8.22684 14.6857 8.16751 14.863 8.0957 15.0302L8.00293 15.2225C7.87956 15.45 7.70461 15.6582 7.54688 15.869C8.18558 16.7012 9.05042 17.097 10.1309 17.0302C11.0371 16.9738 11.7542 16.5739 12.3027 15.8427C11.9079 15.4646 11.6814 15.0106 11.5635 14.496ZM7.17773 6.47839C7.12063 6.48494 7.06482 6.51353 7.00684 6.58386C6.84321 6.78211 6.67677 6.96216 6.57812 7.16199L6.54004 7.2489C6.47845 7.40991 6.43887 7.58182 6.40723 7.75378C6.37786 7.91336 6.35247 8.08565 6.32324 8.2323C6.38011 8.63903 6.42587 8.97532 6.47656 9.3114C6.49154 9.41113 6.51435 9.50875 6.53613 9.61511C6.55739 9.71892 6.57684 9.82828 6.58105 9.94031C6.61705 10.9107 6.88913 11.7937 7.47852 12.5653C8.49938 13.8999 10.2149 14.2283 11.5225 13.3544L11.6719 13.2499C12.4008 12.7122 12.8606 11.9753 13.0762 11.0927C13.2289 10.4657 13.2974 9.81891 13.3896 9.16687C13.4391 8.81617 13.4874 8.46896 13.4785 8.12781C13.4634 7.53 13.3218 6.99033 12.8545 6.59167C12.7767 6.52529 12.7135 6.4954 12.6533 6.48718C12.5928 6.47892 12.5208 6.49105 12.4209 6.53601C10.7589 7.28535 9.08325 7.28583 7.42188 6.53503C7.31781 6.48794 7.23934 6.47136 7.17773 6.47839ZM8.4834 2.46277C8.17798 2.45069 7.85307 2.5131 7.54883 2.60437C7.3882 2.65258 7.30602 2.7233 7.26855 2.80457C7.22974 2.8889 7.22753 3.00822 7.27832 3.17468C7.29746 3.23728 7.32272 3.29997 7.35059 3.36511C7.37782 3.42877 7.40898 3.49752 7.43555 3.56628C7.49021 3.7076 7.49618 3.84893 7.44336 3.97351C7.39039 4.09833 7.2845 4.1925 7.14258 4.24988C7.06497 4.28129 6.98546 4.30722 6.90918 4.33191C6.83205 4.35687 6.75799 4.38024 6.68555 4.4071C5.83237 4.72424 5.38721 5.26147 5.22754 5.88855C5.10666 6.36337 5.14762 6.89831 5.31152 7.44031L5.37598 7.63074C5.50837 6.71269 5.91951 5.96646 6.7832 5.51355C6.92446 5.43951 7.0623 5.39834 7.20508 5.39734C7.34798 5.39642 7.48901 5.43533 7.63574 5.50964C8.50285 5.94976 9.41986 6.14289 10.3955 6.04285L10.6406 6.0116C11.2096 5.92684 11.7488 5.75349 12.2598 5.48621C12.3777 5.42453 12.4939 5.39033 12.6143 5.38855C12.7345 5.38678 12.8519 5.4173 12.9717 5.47449C13.6612 5.80317 14.1276 6.3326 14.3311 7.06531C14.4154 7.36886 14.459 7.6891 14.5049 8.00183C14.7745 7.48093 14.8869 6.9286 14.7803 6.33289C14.6453 5.57759 14.2156 4.98149 13.6396 4.48914C12.1573 3.2221 10.4335 2.54152 8.4834 2.46277Z" fill="#035ED2" stroke="#035ED2" stroke-width="0.2" />
              <path d="M18.4608 15.3985C19.4402 15.3985 20.3906 15.3985 21.3714 15.3985C21.3714 15.2491 21.3686 15.1075 21.3721 14.9659C21.3883 14.2599 21.8181 13.8379 22.5227 13.8379C22.6826 13.8379 22.8468 13.8273 23.0025 13.8576C23.5112 13.9549 23.8613 14.3727 23.8698 14.8976C23.8797 15.5141 23.8789 16.1306 23.8698 16.7471C23.862 17.3065 23.4914 17.7292 22.9348 17.7997C22.7115 17.8279 22.4776 17.8229 22.2549 17.7905C21.7716 17.7201 21.4327 17.3551 21.3869 16.8718C21.3679 16.6731 21.3841 16.4709 21.3841 16.2539C20.3927 16.2539 19.4437 16.2539 18.458 16.2539C18.458 16.4483 18.465 16.6315 18.4566 16.814C18.4326 17.3149 18.0888 17.7172 17.5907 17.787C17.3434 17.8215 17.0834 17.8208 16.8368 17.7856C16.3464 17.7151 15.9835 17.2966 15.9751 16.8048C15.9638 16.1545 15.9702 15.5042 15.9744 14.8539C15.9751 14.763 15.9962 14.6693 16.023 14.5819C16.1984 14.007 16.7508 13.7385 17.5364 13.8421C18.0606 13.9112 18.4404 14.3367 18.4594 14.8828C18.4657 15.0498 18.4608 15.2167 18.4608 15.3985ZM22.1971 15.81C22.1971 16.1059 22.2007 16.4011 22.1957 16.697C22.1922 16.8992 22.2852 16.9944 22.4846 16.9922C22.5776 16.9915 22.6706 16.9908 22.7636 16.9922C22.9531 16.9958 23.049 16.8957 23.0497 16.7146C23.0532 16.1235 23.0532 15.5324 23.0497 14.9412C23.049 14.744 22.9355 14.6524 22.7432 14.6503C22.6671 14.6496 22.591 14.6503 22.5149 14.6503C22.2993 14.6503 22.1873 14.7454 22.1943 14.9744C22.2035 15.2527 22.1971 15.5317 22.1971 15.81ZM17.6463 15.8403C17.6463 15.5458 17.6428 15.2513 17.6477 14.9567C17.6513 14.7566 17.5519 14.6615 17.361 14.6517C17.2687 14.6467 17.1757 14.6474 17.0834 14.651C16.891 14.658 16.7875 14.7588 16.7868 14.9525C16.7853 15.5331 16.7853 16.1144 16.7868 16.6949C16.7875 16.8866 16.8769 16.9951 17.0792 16.9915C17.1715 16.9901 17.2645 16.9908 17.3568 16.9915C17.554 16.993 17.6506 16.9007 17.6477 16.6984C17.6428 16.4131 17.6463 16.1263 17.6463 15.8403Z" fill="#035ED2" />
            </svg>

          </div>
          <p className="text-xl sm:text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
            {keyMetrics.activeSubscriptions}
          </p>
        </div>

        {/* Average Revenue Per User */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-[Inter]">Average Revenue Per User</p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#035ED2" stroke-width="1.5" />
              <path d="M17.5 8.5L10 16.5L6 12.5" stroke="#035ED2" stroke-width="2" stroke-linecap="round" />
            </svg>

          </div>
          <p className="text-xl sm:text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
            {keyMetrics.averageRevenuePerUser}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Subscription Distribution */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          {/* Title */}
          <h2 className="text-lg font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-4">
            Subscription Distribution
          </h2>

          {/* Donut Chart */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-52 h-52 flex-shrink-0 flex items-center justify-center">
              <svg className="w-52 h-52" viewBox="0 0 160 160">
                {chartSegments.map((segment) => (
                  <path
                    key={segment.name}
                    d={segment.path}
                    fill={segment.color}
                    style={{ transition: "all 0.5s ease" }}
                  />
                ))}
              </svg>
            </div>

            {/* Legend EXACT same as screenshot */}
            <div className="flex items-center justify-center gap-6 mt-2">
              {subscriptionDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-6 h-3.5 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  {/* Text Color Logic */}
                  <p
                    className="text-xs font-[Inter]"
                    style={{
                      color:
                        item.name === "Basic Plan"
                          ? "#15B79E"        // green
                          : item.name === "Enterprise Plan"
                            ? "#E53935"        // red
                            : item.name === "Professional plan"
                              ? "#035ED2"        // blue
                              : "#035ED2",          // default
                    }}
                  >
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#003F8F] font-[BasisGrotesquePro]">
              Revenue Overview
            </h2>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003F8F] bg-white">
              <option>Yearly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 8000]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Subscription Plans Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
            Subscription Plans
          </h2>

          {/* Add New Plan Button */}
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002A6A] transition flex items-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add New Plan
          </button>

        </div>

        {/* Loading State */}
        {plansLoading && (
          <div className="text-center py-8">
            <p className="text-[#4D6080CC] font-[Inter]">Loading plans...</p>
          </div>
        )}

        {/* Error State */}
        {plansError && !plansLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm font-[Inter]">{plansError}</p>
            <button
              onClick={fetchSubscriptionPlans}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Plans Carousel */}
        {!plansLoading && !plansError && (
          <div className="relative px-12">
            {/* Left Arrow - Outside card container */}
            <button
              onClick={scrollPlansLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
              aria-label="Scroll left"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Scrollable Container - Shows exactly 3 cards */}
            <div className="overflow-hidden w-full">
              <div
                ref={plansScrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
              >
                {subscriptionPlans.length > 0 ? (
                  subscriptionPlans.map((plan, index) => (
                    <div
                      key={plan.id || index}
                      className="plan-card bg-white rounded-lg p-4 sm:p-6 border border-gray-200 flex-shrink-0"
                      style={{ width: 'calc((100% - 72px) / 3)' }}
                    >
                  {/* Plan Name */}
                  <h3 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro] mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <p className="text-2xl font-bold text-[#F47C20] font-[BasisGrotesquePro] leading-none">
                    {plan.price}
                  </p>
                  <p className="text-sm text-[#7A869A] font-[Inter] mt-1">
                    {plan.period}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6 mt-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.5 9.00061L7.68225 12.1829L14.0452 5.81836" stroke="#F4721E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>

                        <p className="text-sm text-[#003F8F] font-[Inter]">{feature}</p>
                      </div>
                    ))}
                  </div>

                  {/* Edit Button */}
                  <button 
                    onClick={() => handleOpenEditPlan(plan)}
                    className="w-full px-4 py-2 border border-[#003F8F] rounded-lg text-sm font-semibold text-[#003F8F] hover:bg-[#003F8F] hover:text-white transition flex items-center justify-center gap-2 cursor-pointer bg-white"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.3562 4.05611L13.944 5.64386M13.377 2.65736L9.08175 6.95261C8.85916 7.17375 8.70768 7.45632 8.64675 7.76411L8.25 9.75011L10.236 9.35261C10.5435 9.29111 10.8255 9.14036 11.0475 8.91836L15.3427 4.62311C15.4718 4.49404 15.5742 4.34081 15.6441 4.17217C15.7139 4.00353 15.7499 3.82278 15.7499 3.64024C15.7499 3.4577 15.7139 3.27695 15.6441 3.10831C15.5742 2.93967 15.4718 2.78644 15.3427 2.65736C15.2137 2.52829 15.0604 2.4259 14.8918 2.35605C14.7232 2.2862 14.5424 2.25024 14.3599 2.25024C14.1773 2.25024 13.9966 2.2862 13.8279 2.35605C13.6593 2.4259 13.5061 2.52829 13.377 2.65736Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.25 11.25V13.5C14.25 13.8978 14.092 14.2794 13.8107 14.5607C13.5294 14.842 13.1478 15 12.75 15H4.5C4.10218 15 3.72064 14.842 3.43934 14.5607C3.15804 14.2794 3 13.8978 3 13.5V5.25C3 4.85218 3.15804 4.47064 3.43934 4.18934C3.72064 3.90804 4.10218 3.75 4.5 3.75H6.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Edit Plan
                  </button>
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full text-center py-8">
                  <p className="text-[#4D6080CC] font-[Inter]">No subscription plans found.</p>
                </div>
              )}
              </div>
            </div>

            {/* Right Arrow - Outside card container */}
            <button
              onClick={scrollPlansRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
              aria-label="Scroll right"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#003F8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>


      {/* Recent Transactions Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-[#003F8F] font-[BasisGrotesquePro]">
            Recent Transactions
          </h2>

          <button   onClick={() => setShowInvoiceModal(true)}
           className="px-4 py-2 bg-[#003F8F] text-white rounded-lg text-sm font-semibold hover:bg-[#002F6F] transition flex items-center gap-2 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10L12 15L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export All Invoices
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Transaction ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-[Inter]">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedTransactions.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-sm text-[#003F8F] font-semibold cursor-pointer">
                    {transaction.transactionId}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-[#003F8F]">
                    {transaction.user}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-[#003F8F]">
                    {transaction.date}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-[#003F8F]">
                    {transaction.amount}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: transaction.planColor }}
                    >
                      {transaction.plan}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full">
                      {transaction.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg border border-gray-300 transition cursor-pointer">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#003F8F" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="#003F8F" strokeWidth="2" />
                        </svg>
                      </button>

                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg border border-gray-300 transition cursor-pointer">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#003F8F" strokeWidth="2" />
                          <path d="M7 10L12 15L17 10" stroke="#003F8F" strokeWidth="2" />
                          <path d="M12 15V3" stroke="#003F8F" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Right side */}
        <div className="flex items-center justify-end gap-2 mt-6 pr-2">

          {/* Prev */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer 
      ${currentPage === 1
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;

            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm transition cursor-pointer
            ${currentPage === pageNum
                      ? 'bg-[#003F8F] text-white border-[#003F8F]'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            }

            // Dots
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={pageNum} className="text-gray-400 px-2">…</span>;
            }

            return null;
          })}

          {/* Next */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer
      ${currentPage === totalPages
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

        </div>
      </div>

      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 relative my-auto max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAddPlanModal(false);
                setPlanError('');
                setPlanSuccess(false);
                setValidationErrors({});
                setPlanFormData({
                  name: '',
                  description: '',
                  monthly_price: '',
                  yearly_price: '',
                  max_clients: '',
                  max_users: '1',
                  storage_limit_gb: '',
                  features: [],
                  stripe_monthly_price_id: '',
                  stripe_yearly_price_id: '',
                  is_active: true
                });
              }}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 cursor-pointer z-10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#4D6080" fillOpacity="0.8" />
                <path d="M13.3888 7.49584C13.4485 7.43821 13.4962 7.36927 13.529 7.29303C13.5618 7.2168 13.579 7.13479 13.5798 7.05181C13.5806 6.96882 13.5648 6.88651 13.5334 6.80969C13.502 6.73286 13.4556 6.66306 13.397 6.60435C13.3383 6.54564 13.2686 6.4992 13.1918 6.46774C13.115 6.43628 13.0327 6.42042 12.9497 6.4211C12.8667 6.42179 12.7847 6.43899 12.7084 6.47171C12.6322 6.50443 12.5632 6.55201 12.5055 6.61167L10.0005 9.11584L7.49632 6.61167C7.4391 6.55027 7.3701 6.50102 7.29343 6.46686C7.21677 6.4327 7.13401 6.41433 7.05009 6.41285C6.96617 6.41137 6.88281 6.4268 6.80499 6.45824C6.72716 6.48967 6.65647 6.53646 6.59712 6.59581C6.53777 6.65516 6.49098 6.72585 6.45955 6.80368C6.42812 6.8815 6.41268 6.96486 6.41416 7.04878C6.41564 7.1327 6.43401 7.21546 6.46817 7.29212C6.50233 7.36879 6.55158 7.43779 6.61299 7.49501L9.11549 10L6.61132 12.5042C6.50092 12.6227 6.44082 12.7794 6.44367 12.9413C6.44653 13.1032 6.51212 13.2577 6.62663 13.3722C6.74115 13.4867 6.89563 13.5523 7.05755 13.5552C7.21947 13.558 7.37617 13.4979 7.49465 13.3875L10.0005 10.8833L12.5047 13.3883C12.6231 13.4987 12.7798 13.5588 12.9418 13.556C13.1037 13.5531 13.2582 13.4875 13.3727 13.373C13.4872 13.2585 13.5528 13.104 13.5556 12.9421C13.5585 12.7802 13.4984 12.6235 13.388 12.505L10.8855 10L13.3888 7.49584Z" fill="white" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-[22px] font-bold text-[#003F8F] mb-4">
              Add New Subscription Plan
            </h2>

            {/* Error Message */}
            {planError && (
              <div className="mb-3 sm:mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                {planError}
              </div>
            )}

            {/* Success Message */}
            {planSuccess && (
              <div className="mb-3 sm:mb-4 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                Create plan successfully!
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 sm:space-y-5">
              {/* Plan Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F]">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => {
                    setPlanFormData({ ...planFormData, name: e.target.value });
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: '' });
                    }
                  }}
                  placeholder="Enter Plan Name"
                  className={`w-full text-[#4D6080CC] mt-1 px-3 py-2 border rounded-lg text-xs sm:text-sm focus:ring-[#003F8F] focus:border-[#003F8F] ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Monthly Price */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F]">Monthly Price ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={planFormData.monthly_price}
                  onChange={(e) => {
                    const monthly = e.target.value;
                    setPlanFormData({ 
                      ...planFormData, 
                      monthly_price: monthly,
                      yearly_price: monthly ? (parseFloat(monthly) * 12).toFixed(2) : ''
                    });
                    if (validationErrors.monthly_price) {
                      setValidationErrors({ ...validationErrors, monthly_price: '' });
                    }
                  }}
                  placeholder="0.00"
                  className={`w-full mt-1 px-3 py-2 text-[#4D6080CC] border rounded-lg text-xs sm:text-sm focus:ring-[#003F8F] focus:border-[#003F8F] ${
                    validationErrors.monthly_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.monthly_price && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.monthly_price}</p>
                )}
              </div>

              {/* Maximum Clients */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F]">Maximum Clients</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={planFormData.max_clients}
                  onChange={(e) => {
                    setPlanFormData({ ...planFormData, max_clients: e.target.value });
                    if (validationErrors.max_clients) {
                      setValidationErrors({ ...validationErrors, max_clients: '' });
                    }
                  }}
                  placeholder="Enter Maximum Clients"
                  className={`w-full mt-1 px-3 py-2 text-[#4D6080CC] border rounded-lg text-xs sm:text-sm focus:ring-[#003F8F] focus:border-[#003F8F] ${
                    validationErrors.max_clients ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.max_clients && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.max_clients}</p>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F] mb-2">Features</label>
                <div className="mt-2 space-y-2 text-xs sm:text-sm text-[#4D6080CC]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('advanced_workout_builder')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'advanced_workout_builder']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'advanced_workout_builder')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Advanced Workout Builder</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('custom_branding')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'custom_branding']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'custom_branding')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Custom Branding</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('priority_support')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'priority_support']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'priority_support')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Priority Support</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('advanced_analytics')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'advanced_analytics']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'advanced_analytics')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Advanced analytics</span>
                  </label>
                </div>
                {validationErrors.features && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.features}</p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowAddPlanModal(false);
                  setPlanError('');
                  setPlanSuccess(false);
                  setValidationErrors({});
                  setPlanFormData({
                    name: '',
                    description: '',
                    monthly_price: '',
                    yearly_price: '',
                    max_clients: '',
                    max_users: '1',
                    storage_limit_gb: '',
                    features: [],
                    stripe_monthly_price_id: '',
                    stripe_yearly_price_id: '',
                    is_active: true
                  });
                }}
                disabled={planLoading}
                className="w-full sm:w-auto px-4 py-2 border border-[#4D6080CC] rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleCreatePlan(e);
                }}
                disabled={planLoading}
                className="w-full sm:w-auto px-5 py-2 bg-[#003F8F] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#002A6A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {planLoading ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}






      {/* Edit Plan Modal */}
      {showEditPlanModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 relative my-auto max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowEditPlanModal(false);
                setEditingPlanId(null);
                setPlanError('');
                setPlanSuccess(false);
                setValidationErrors({});
                setPlanFormData({
                  name: '',
                  description: '',
                  monthly_price: '',
                  yearly_price: '',
                  max_clients: '',
                  max_users: '1',
                  storage_limit_gb: '',
                  features: [],
                  stripe_monthly_price_id: '',
                  stripe_yearly_price_id: '',
                  is_active: true
                });
              }}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 cursor-pointer z-10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#4D6080" fillOpacity="0.8" />
                <path d="M13.3888 7.49584C13.4485 7.43821 13.4962 7.36927 13.529 7.29303C13.5618 7.2168 13.579 7.13479 13.5798 7.05181C13.5806 6.96882 13.5648 6.88651 13.5334 6.80969C13.502 6.73286 13.4556 6.66306 13.397 6.60435C13.3383 6.54564 13.2686 6.4992 13.1918 6.46774C13.115 6.43628 13.0327 6.42042 12.9497 6.4211C12.8667 6.42179 12.7847 6.43899 12.7084 6.47171C12.6322 6.50443 12.5632 6.55201 12.5055 6.61167L10.0005 9.11584L7.49632 6.61167C7.4391 6.55027 7.3701 6.50102 7.29343 6.46686C7.21677 6.4327 7.13401 6.41433 7.05009 6.41285C6.96617 6.41137 6.88281 6.4268 6.80499 6.45824C6.72716 6.48967 6.65647 6.53646 6.59712 6.59581C6.53777 6.65516 6.49098 6.72585 6.45955 6.80368C6.42812 6.8815 6.41268 6.96486 6.41416 7.04878C6.41564 7.1327 6.43401 7.21546 6.46817 7.29212C6.50233 7.36879 6.55158 7.43779 6.61299 7.49501L9.11549 10L6.61132 12.5042C6.50092 12.6227 6.44082 12.7794 6.44367 12.9413C6.44653 13.1032 6.51212 13.2577 6.62663 13.3722C6.74115 13.4867 6.89563 13.5523 7.05755 13.5552C7.21947 13.558 7.37617 13.4979 7.49465 13.3875L10.0005 10.8833L12.5047 13.3883C12.6231 13.4987 12.7798 13.5588 12.9418 13.556C13.1037 13.5531 13.2582 13.4875 13.3727 13.373C13.4872 13.2585 13.5528 13.104 13.5556 12.9421C13.5585 12.7802 13.4984 12.6235 13.388 12.505L10.8855 10L13.3888 7.49584Z" fill="white" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-[22px] font-bold text-[#003F8F] mb-4">
              Edit Subscription Plan
            </h2>

            {/* Error Message */}
            {planError && (
              <div className="mb-3 sm:mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                {planError}
              </div>
            )}

            {/* Success Message */}
            {planSuccess && (
              <div className="mb-3 sm:mb-4 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                Plan updated successfully!
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 sm:space-y-5">
              {/* Plan Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F]">Plan Name</label>
                <input
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => {
                    setPlanFormData({ ...planFormData, name: e.target.value });
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: '' });
                    }
                  }}
                  placeholder="Enter Plan Name"
                  className={`w-full text-[#4D6080CC] mt-1 px-3 py-2 border rounded-lg text-xs sm:text-sm focus:ring-[#003F8F] focus:border-[#003F8F] ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>

              {/* Monthly Price */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F]">Monthly Price ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={planFormData.monthly_price}
                  onChange={(e) => {
                    const monthly = e.target.value;
                    setPlanFormData({ 
                      ...planFormData, 
                      monthly_price: monthly,
                      yearly_price: monthly ? (parseFloat(monthly) * 12).toFixed(2) : ''
                    });
                    if (validationErrors.monthly_price) {
                      setValidationErrors({ ...validationErrors, monthly_price: '' });
                    }
                  }}
                  placeholder="0.00"
                  className={`w-full mt-1 px-3 py-2 text-[#4D6080CC] border rounded-lg text-xs sm:text-sm focus:ring-[#003F8F] focus:border-[#003F8F] ${
                    validationErrors.monthly_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.monthly_price && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.monthly_price}</p>
                )}
              </div>

              {/* Maximum Clients */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F]">Maximum Clients</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={planFormData.max_clients}
                  onChange={(e) => {
                    setPlanFormData({ ...planFormData, max_clients: e.target.value });
                    if (validationErrors.max_clients) {
                      setValidationErrors({ ...validationErrors, max_clients: '' });
                    }
                  }}
                  placeholder="Enter Maximum Clients"
                  className={`w-full mt-1 px-3 py-2 text-[#4D6080CC] border rounded-lg text-xs sm:text-sm focus:ring-[#003F8F] focus:border-[#003F8F] ${
                    validationErrors.max_clients ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.max_clients && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.max_clients}</p>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#003F8F] mb-2">Features</label>
                <div className="mt-2 space-y-2 text-xs sm:text-sm text-[#4D6080CC]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('advanced_workout_builder')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'advanced_workout_builder']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'advanced_workout_builder')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Advanced Workout Builder</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('custom_branding')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'custom_branding']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'custom_branding')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Custom Branding</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('priority_support')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'priority_support']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'priority_support')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Priority Support</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planFormData.features.includes('advanced_analytics')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData({
                            ...planFormData,
                            features: [...planFormData.features, 'advanced_analytics']
                          });
                        } else {
                          setPlanFormData({
                            ...planFormData,
                            features: planFormData.features.filter(f => f !== 'advanced_analytics')
                          });
                        }
                        if (validationErrors.features) {
                          setValidationErrors({ ...validationErrors, features: '' });
                        }
                      }}
                    />
                    <span>Advanced analytics</span>
                  </label>
                </div>
                {validationErrors.features && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.features}</p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowEditPlanModal(false);
                  setEditingPlanId(null);
                  setPlanError('');
                  setPlanSuccess(false);
                  setValidationErrors({});
                  setPlanFormData({
                    name: '',
                    description: '',
                    monthly_price: '',
                    yearly_price: '',
                    max_clients: '',
                    max_users: '1',
                    storage_limit_gb: '',
                    features: [],
                    stripe_monthly_price_id: '',
                    stripe_yearly_price_id: '',
                    is_active: true
                  });
                }}
                disabled={planLoading}
                className="w-full sm:w-auto px-4 py-2 border border-[#4D6080CC] rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleUpdatePlan(e);
                }}
                disabled={planLoading}
                className="w-full sm:w-auto px-5 py-2 bg-[#003F8F] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#002A6A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {planLoading ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default BillingSubscriptions;

