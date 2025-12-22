import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Use API URL from .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

const AddNewClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    inviteEmail: '',
    name: '',
    email: '',
    gender: '',
    contactNumber: '',
    address: '',
    goals: '',
    level: '',
    equipments: {
      dumbbells: false,
      barbell: false,
      machines: false
    },
    age: '',
    height: '',
    weight: '',
    medicalConditions: '',
    primaryFitnessGoal: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Validation helper functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Contact number is required';
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return 'Please enter a valid contact number (10 digits)';
    }
    return '';
  };

  const validateAge = (age) => {
    if (!age || (typeof age === 'string' && age.trim() === '')) {
      return 'Age is required';
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return 'Please enter a valid age (1-120)';
    }
    return '';
  };

  const validateHeight = (height) => {
    if (!height || (typeof height === 'string' && height.trim() === '')) {
      return 'Height is required';
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum)) {
      return 'Please enter a valid height';
    }
    if (heightNum < 50) {
      return 'Height must be greater than or equal to 50 cm';
    }
    if (heightNum > 300) {
      return 'Height must be less than or equal to 300 cm';
    }
    return '';
  };

  const validateWeight = (weight) => {
    if (!weight || (typeof weight === 'string' && weight.trim() === '')) {
      return 'Weight is required';
    }
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum)) {
      return 'Please enter a valid weight';
    }
    if (weightNum < 10) {
      return 'Weight must be greater than or equal to 10 kg';
    }
    if (weightNum > 500) {
      return 'Weight must be less than or equal to 500 kg';
    }
    return '';
  };

  const validateEquipments = (equipments) => {
    if (!equipments || (!equipments.dumbbells && !equipments.barbell && !equipments.machines)) {
      return 'Equipments Access is required';
    }
    return '';
  };

  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 100) {
      return 'Name must be less than 100 characters';
    }
    return '';
  };

  const validateLevel = (level) => {
    if (!level || (typeof level === 'string' && level.trim() === '')) {
      return 'Level is required';
    }
    return '';
  };

  const validateGender = (gender) => {
    if (!gender || (typeof gender === 'string' && gender.trim() === '')) {
      return 'Gender is required';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address || (typeof address === 'string' && address.trim() === '')) {
      return 'Address is required';
    }
    const trimmedAddress = typeof address === 'string' ? address.trim() : String(address).trim();
    if (trimmedAddress.length > 200) {
      return 'Address must be less than 200 characters';
    }
    return '';
  };

  const validateGoals = (goals) => {
    if (!goals || (typeof goals === 'string' && goals.trim() === '')) {
      return 'Goals is required';
    }
    const trimmedGoals = typeof goals === 'string' ? goals.trim() : String(goals).trim();
    if (trimmedGoals.length > 500) {
      return 'Goals must be less than 500 characters';
    }
    return '';
  };

  const validateMedicalConditions = (medicalConditions) => {
    if (!medicalConditions || (typeof medicalConditions === 'string' && medicalConditions.trim() === '')) {
      return 'Medical Conditions / Injuries is required';
    }
    const trimmed = typeof medicalConditions === 'string' ? medicalConditions.trim() : String(medicalConditions).trim();
    if (trimmed.length > 500) {
      return 'Medical conditions must be less than 500 characters';
    }
    return '';
  };

  const validatePrimaryFitnessGoal = (primaryFitnessGoal) => {
    if (!primaryFitnessGoal || (typeof primaryFitnessGoal === 'string' && primaryFitnessGoal.trim() === '')) {
      return 'Primary Fitness Goal is required';
    }
    const trimmed = typeof primaryFitnessGoal === 'string' ? primaryFitnessGoal.trim() : String(primaryFitnessGoal).trim();
    if (trimmed.length > 200) {
      return 'Primary fitness goal must be less than 200 characters';
    }
    return '';
  };

  const validateNotes = (notes) => {
    if (!notes || (typeof notes === 'string' && notes.trim() === '')) {
      return 'Notes is required';
    }
    const trimmed = typeof notes === 'string' ? notes.trim() : String(notes).trim();
    if (trimmed.length > 1000) {
      return 'Notes must be less than 1000 characters';
    }
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Validate field on blur
    let errorMessage = '';
    
    // Required fields - always validate
    if (name === 'name') {
      errorMessage = validateName(value);
    } else if (name === 'email') {
      errorMessage = validateEmail(value);
    } else if (name === 'contactNumber') {
      errorMessage = validatePhone(value);
    } else if (name === 'address') {
      errorMessage = validateAddress(value);
    } else if (name === 'gender') {
      errorMessage = validateGender(value);
    } else if (name === 'goals') {
      errorMessage = validateGoals(value);
    } else if (name === 'level') {
      errorMessage = validateLevel(value);
    } else if (name === 'age') {
      errorMessage = validateAge(value);
    } else if (name === 'height') {
      errorMessage = validateHeight(value);
    } else if (name === 'weight') {
      errorMessage = validateWeight(value);
    } else if (name === 'medicalConditions') {
      errorMessage = validateMedicalConditions(value);
    } else if (name === 'primaryFitnessGoal') {
      errorMessage = validatePrimaryFitnessGoal(value);
    } else if (name === 'notes') {
      errorMessage = validateNotes(value);
    }

    // Set or clear error based on validation
    if (errorMessage) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    } else {
      // Clear error if validation passes
      if (fieldErrors[name]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    const { name, value, type } = e.target;
    const isTextarea = type === 'textarea' || e.target.tagName === 'TEXTAREA';
    let errorMessage = '';
    
    // Validate the current field
    if (name === 'name') {
      errorMessage = validateName(value);
    } else if (name === 'email') {
      errorMessage = validateEmail(value);
    } else if (name === 'contactNumber') {
      errorMessage = validatePhone(value);
    } else if (name === 'address') {
      errorMessage = validateAddress(value);
    } else if (name === 'gender') {
      errorMessage = validateGender(value);
    } else if (name === 'goals') {
      errorMessage = validateGoals(value);
    } else if (name === 'level') {
      errorMessage = validateLevel(value);
    } else if (name === 'age') {
      errorMessage = validateAge(value);
    } else if (name === 'height') {
      errorMessage = validateHeight(value);
    } else if (name === 'weight') {
      errorMessage = validateWeight(value);
    } else if (name === 'medicalConditions') {
      errorMessage = validateMedicalConditions(value);
    } else if (name === 'primaryFitnessGoal') {
      errorMessage = validatePrimaryFitnessGoal(value);
    } else if (name === 'notes') {
      errorMessage = validateNotes(value);
    }
    
    // If field has error, prevent Tab from moving focus
    // For textarea, allow Enter to create new lines
    if (errorMessage) {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Set error and keep focus on the field
        setFieldErrors(prev => ({
          ...prev,
          [name]: errorMessage
        }));
        e.target.focus();
      } else if (e.key === 'Enter' && !isTextarea) {
        // Prevent Enter from submitting form only for input fields, not textarea
        e.preventDefault();
        // Set error and keep focus on the field
        setFieldErrors(prev => ({
          ...prev,
          [name]: errorMessage
        }));
        e.target.focus();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const updatedEquipments = {
        ...formData.equipments,
        [name]: checked
      };
      setFormData(prev => ({
        ...prev,
        equipments: updatedEquipments
      }));
      
      // Validate equipments when checkbox changes
      const equipmentsError = validateEquipments(updatedEquipments);
      if (equipmentsError) {
        setFieldErrors(prev => ({
          ...prev,
          equipments: equipmentsError
        }));
      } else {
        // Clear error if validation passes
        if (fieldErrors.equipments) {
          setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.equipments;
            return newErrors;
          });
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Validate gender when radio button is selected
      if (name === 'gender') {
        const genderError = validateGender(value);
        if (genderError) {
          setFieldErrors(prev => ({
            ...prev,
            gender: genderError
          }));
        } else {
          // Clear error if validation passes
          if (fieldErrors.gender) {
            setFieldErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.gender;
              return newErrors;
            });
          }
        }
      } else {
        // Clear error when user starts typing (for better UX)
        if (fieldErrors[name]) {
          setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all fields FIRST before setting loading
    const errors = {};
    
    // Name validation
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Contact number validation
    const phoneError = validatePhone(formData.contactNumber);
    if (phoneError) errors.contactNumber = phoneError;

    // Gender validation
    const genderError = validateGender(formData.gender);
    if (genderError) errors.gender = genderError;

    // Age validation
    const ageError = validateAge(formData.age);
    if (ageError) errors.age = ageError;

    // Height validation
    const heightError = validateHeight(formData.height);
    if (heightError) errors.height = heightError;

    // Weight validation
    const weightError = validateWeight(formData.weight);
    if (weightError) errors.weight = weightError;

    // Address validation
    const addressError = validateAddress(formData.address);
    if (addressError) errors.address = addressError;

      // Goals validation
      const goalsError = validateGoals(formData.goals);
      if (goalsError) errors.goals = goalsError;

      // Level validation
      const levelError = validateLevel(formData.level);
      if (levelError) errors.level = levelError;

      // Equipments validation
      const equipmentsError = validateEquipments(formData.equipments);
      if (equipmentsError) errors.equipments = equipmentsError;

      // Medical Conditions validation
    const medicalConditionsError = validateMedicalConditions(formData.medicalConditions);
    if (medicalConditionsError) errors.medicalConditions = medicalConditionsError;

    // Primary Fitness Goal validation
    const primaryFitnessGoalError = validatePrimaryFitnessGoal(formData.primaryFitnessGoal);
    if (primaryFitnessGoalError) errors.primaryFitnessGoal = primaryFitnessGoalError;

    // Notes validation
    const notesError = validateNotes(formData.notes);
    if (notesError) errors.notes = notesError;

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors in the form before submitting.');
      // Scroll to first error field in form order (not validation order)
      setTimeout(() => {
        // Define the correct form field order
        const formFieldOrder = [
          'name',
          'email',
          'gender',
          'contactNumber',
          'address',
          'goals',
          'level',
          'dumbbells', // First equipment checkbox
          'age',
          'height',
          'weight',
          'medicalConditions',
          'primaryFitnessGoal',
          'notes'
        ];
        
        // Find the first error field in form order
        let firstErrorField = null;
        for (const fieldName of formFieldOrder) {
          if (errors[fieldName] || (fieldName === 'dumbbells' && errors.equipments)) {
            firstErrorField = fieldName === 'dumbbells' ? 'equipments' : fieldName;
            break;
          }
        }
        
        // If not found in predefined order, use first key from errors
        if (!firstErrorField) {
          firstErrorField = Object.keys(errors)[0];
        }
        
        // For equipments error, focus on first checkbox
        if (firstErrorField === 'equipments') {
          const equipmentsElement = document.querySelector(`[name="dumbbells"]`);
          if (equipmentsElement) {
            equipmentsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            equipmentsElement.focus();
          }
        } else {
          // For gender, focus on first radio button
          if (firstErrorField === 'gender') {
            const genderElement = document.querySelector(`[name="gender"][value="Male"]`);
            if (genderElement) {
              genderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              genderElement.focus();
            }
          } else {
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              errorElement.focus();
            }
          }
        }
      }, 100);
      return;
    }

    // Clear any previous errors if validation passes
    setFieldErrors({});
    setLoading(true);

    try {

      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');

      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined' &&
        token.trim() !== '';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/coach/add-client/`;

      // Prepare equipments array
      const equipmentsArray = [];
      if (formData.equipments.dumbbells) equipmentsArray.push('dumbbells');
      if (formData.equipments.barbell) equipmentsArray.push('barbell');
      if (formData.equipments.machines) equipmentsArray.push('machines');

      // Prepare request body
      // Send address as city field since API expects city and returns city in response
      const requestBody = {
        name: formData.name,
        email: formData.email,
        contact_number: formData.contactNumber,
        city: formData.address || '', // Send address as city field
        address: formData.address || '', // Also send as address for compatibility
        gender: formData.gender ? formData.gender.toLowerCase() : '',
        level: formData.level ? formData.level.toLowerCase() : 'beginner',
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        goals: formData.goals || '',
        primary_fitness_goal: formData.primaryFitnessGoal || '',
        equipments_access: equipmentsArray,
        medical_conditions: formData.medicalConditions || '',
        notes: formData.notes || ''
      };
      
      console.log('Request body with address/city:', requestBody);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

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
        setError('Failed to parse server response. Please try again.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccess(result.message || 'Client added successfully!');
        setFieldErrors({});
        
        // Reset form
        setFormData({
          inviteEmail: '',
          name: '',
          email: '',
          gender: '',
          contactNumber: '',
          address: '',
          goals: '',
          level: '',
          equipments: {
            dumbbells: false,
            barbell: false,
            machines: false
          },
          age: '',
          height: '',
          weight: '',
          medicalConditions: '',
          primaryFitnessGoal: '',
          notes: ''
        });

        // Dispatch event to refresh clients list
        window.dispatchEvent(new CustomEvent('refreshClients'));

        // Call callback to refresh client list if provided
        if (onClientAdded) {
          onClientAdded();
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        console.error('Failed to add client:', result);
        
        // Map API field names to form field names
        const apiToFormFieldMap = {
          'name': 'name',
          'email': 'email',
          'contact_number': 'contactNumber',
          'contactNumber': 'contactNumber',
          'city': 'address',
          'address': 'address',
          'gender': 'gender',
          'level': 'level',
          'age': 'age',
          'height': 'height',
          'weight': 'weight',
          'goals': 'goals',
          'primary_fitness_goal': 'primaryFitnessGoal',
          'primaryFitnessGoal': 'primaryFitnessGoal',
          'equipments_access': 'equipments',
          'equipmentsAccess': 'equipments',
          'medical_conditions': 'medicalConditions',
          'medicalConditions': 'medicalConditions',
          'notes': 'notes'
        };
        
        // Handle field-specific validation errors from API
        const apiFieldErrors = {};
        let generalError = result.message || result.error || result.detail || 'Failed to add client. Please try again.';
        
        // Check if API returned field-specific errors
        if (result.errors && typeof result.errors === 'object') {
          Object.keys(result.errors).forEach((apiFieldName) => {
            const formFieldName = apiToFormFieldMap[apiFieldName] || apiFieldName;
            const fieldError = result.errors[apiFieldName];
            
            // Handle different error formats (array, string, object)
            if (Array.isArray(fieldError)) {
              apiFieldErrors[formFieldName] = fieldError[0]; // Take first error message
            } else if (typeof fieldError === 'string') {
              apiFieldErrors[formFieldName] = fieldError;
            } else if (typeof fieldError === 'object' && fieldError.message) {
              apiFieldErrors[formFieldName] = fieldError.message;
            }
          });
        }
        
        // Set field errors if any
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors(apiFieldErrors);
          setError('Please fix the errors in the form before submitting.');
          
          // Scroll to first error field in form order
          setTimeout(() => {
            const formFieldOrder = [
              'name',
              'email',
              'gender',
              'contactNumber',
              'address',
              'goals',
              'level',
              'dumbbells',
              'age',
              'height',
              'weight',
              'medicalConditions',
              'primaryFitnessGoal',
              'notes'
            ];
            
            let firstErrorField = null;
            for (const fieldName of formFieldOrder) {
              if (apiFieldErrors[fieldName] || (fieldName === 'dumbbells' && apiFieldErrors.equipments)) {
                firstErrorField = fieldName === 'dumbbells' ? 'equipments' : fieldName;
                break;
              }
            }
            
            if (!firstErrorField) {
              firstErrorField = Object.keys(apiFieldErrors)[0];
            }
            
            if (firstErrorField === 'equipments') {
              const equipmentsElement = document.querySelector(`[name="dumbbells"]`);
              if (equipmentsElement) {
                equipmentsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                equipmentsElement.focus();
              }
            } else if (firstErrorField === 'gender') {
              const genderElement = document.querySelector(`[name="gender"][value="Male"]`);
              if (genderElement) {
                genderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                genderElement.focus();
              }
            } else {
              const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
              if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
              }
            }
          }, 100);
        } else {
          // No field-specific errors, show general error
          setError(generalError);
        }
      }
    } catch (err) {
      console.error('Add client error:', err);
      setError('Network error: Unable to add client. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setError('');
    setInviteSuccess('');
    
    // Validate invite email
    const emailError = validateEmail(formData.inviteEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    setInviteLoading(true);

    try {
      // Get authentication token
      let token = null;
      const storedUser = localStorage.getItem('user');

      if (user) {
        token = user.token || user.access_token || user.authToken || user.accessToken;
      }

      if (!token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token || userData.access_token || userData.authToken || userData.accessToken;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      }

      const isValidToken = token &&
        typeof token === 'string' &&
        token.trim().length > 0 &&
        token.trim() !== 'null' &&
        token.trim() !== 'undefined' &&
        token.trim() !== '';

      // Ensure API_BASE_URL doesn't have trailing slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const apiUrl = `${baseUrl}/coach/invite-client/`;

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      if (isValidToken) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({ email: formData.inviteEmail }),
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
        setError('Failed to parse server response. Please try again.');
        setInviteLoading(false);
        return;
      }

      if (response.ok) {
        setInviteSuccess(result.message || 'Invitation sent successfully!');
        setFormData(prev => ({ ...prev, inviteEmail: '' }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setInviteSuccess('');
        }, 3000);
      } else {
        console.error('Failed to invite client:', result);
        setError(result.message || result.error || 'Failed to send invitation. Please try again.');
      }
    } catch (err) {
      console.error('Invite client error:', err);
      setError('Network error: Unable to send invitation. Please check your connection.');
    } finally {
      setInviteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003F8F] font-[Poppins]">Add New Client</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invite Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter email"
              value={formData.inviteEmail}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, inviteEmail: e.target.value }));
                setError('');
                setInviteSuccess('');
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm"
            />
          </div>
          <div className="flex justify-end items-center gap-3">
            {inviteSuccess && (
              <span className="text-sm text-green-600">{inviteSuccess}</span>
            )}
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviteLoading}
              className="px-6 py-2.5 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteLoading ? 'Sending...' : 'Invite'}
            </button>
          </div>

          {/* Manual Entry Section */}
          <div className=" pt-6">
            <h3 className="text-lg font-semibold text-[#003F8F] font-[Poppins] mb-6">Manual Entry</h3>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={1}
                  placeholder="Enter name"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={2}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Gender <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      tabIndex={3}
                      className="w-4 h-4 text-[#003F8F] focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      tabIndex={3}
                      className="w-4 h-4 text-[#003F8F] focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Female</span>
                  </label>
                </div>
                {fieldErrors.gender && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.gender}</p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Contact Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={5}
                  placeholder="Enter contact number (10 digits)"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.contactNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.contactNumber}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={6}
                  placeholder="Enter address"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Goals <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={7}
                  placeholder="Enter your goal"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.goals ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.goals && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.goals}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Level <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    tabIndex={8}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm appearance-none bg-white ${
                      fieldErrors.level ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Enter your level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="#4D6080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                {fieldErrors.level && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.level}</p>
                )}
              </div>

              {/* Equipments Access */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-3 font-[Poppins]">Equipments Access <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="dumbbells"
                      checked={formData.equipments.dumbbells}
                      onChange={handleChange}
                      tabIndex={9}
                      className="w-4 h-4 text-[#003F8F] rounded focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Dumbbells</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="barbell"
                      checked={formData.equipments.barbell}
                      onChange={handleChange}
                      tabIndex={9}
                      className="w-4 h-4 text-[#003F8F] rounded focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Barbell</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="machines"
                      checked={formData.equipments.machines}
                      onChange={handleChange}
                      tabIndex={9}
                      className="w-4 h-4 text-[#003F8F] rounded focus:ring-[#003F8F]"
                    />
                    <span className="text-sm text-gray-700 font-[Inter]">Machines</span>
                  </label>
                </div>
                {fieldErrors.equipments && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.equipments}</p>
                )}
              </div>

              {/* Physical Attributes */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#003F8F] mb-2 font-medium font-[Poppins]">Age <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      tabIndex={10}
                      placeholder="Add age (1-120)"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                    {fieldErrors.age && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.age}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#003F8F] mb-2 font-medium font-[Poppins]">Height (cm) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={11}
                  placeholder="Add height in cm"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                        fieldErrors.height ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.height && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.height}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#003F8F] mb-2 font-medium font-[Poppins]">Weight (kg) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={12}
                  placeholder="Add weight in kg"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                        fieldErrors.weight ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {fieldErrors.weight && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.weight}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Medical Conditions / Injuries <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={13}
                  placeholder="Enter medical conditions"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.medicalConditions ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.medicalConditions && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.medicalConditions}</p>
                )}
              </div>

              {/* Primary Fitness Goal */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Primary Fitness Goal <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="primaryFitnessGoal"
                  value={formData.primaryFitnessGoal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={14}
                  placeholder="Enter primary fitness goal"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm ${
                    fieldErrors.primaryFitnessGoal ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.primaryFitnessGoal && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.primaryFitnessGoal}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#003F8F] mb-2 font-[Poppins]">Notes <span className="text-red-500">*</span></label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  tabIndex={15}
                  placeholder="Enter your notes"
                  rows="3"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F8F] focus:border-transparent text-sm resize-none ${
                    fieldErrors.notes ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.notes && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-[50%]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-6 py-3 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 py-3 bg-[#003F8F] text-white rounded-lg font-semibold text-sm hover:bg-[#002F6F] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </div>


        </form>
      </div>
    </div>
  );
};

export default AddNewClientModal;

