import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { URLS } from '../../services/ApiServices';
import { useNavigate } from 'react-router-dom';
import './index.css';

const CreateAgency = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    agencyName: '',
    description: '',
    website: '',
    industry: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agencyName.trim()) {
      setError('Agency name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setError('You must be logged in to create an agency');
        return;
      }

      const response = await fetch(URLS.create_organization, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          agencyName: formData.agencyName,
          description: formData.description || null,
          website: formData.website || null,
          industry: formData.industry || null,
          userId: session.user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agency');
      }

      const data = await response.json();
      console.log('Agency created:', data);

      // Wait a moment for database consistency, then reload the page
      // This ensures the auth state recognizes the user as an owner
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (err) {
      console.error('Create agency error:', err);
      setError(err.message || 'Failed to create agency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    navigate('/create-section');
  };

  return (
    <div className="agency-container">
      <div className="agency-card">
        <div className="agency-header">
          <h1 className="agency-title">
            🏢 Create Your Agency
          </h1>
          <p className="agency-subtitle agency-subtitle-small">
            Set up your agency to manage team calendars
          </p>
        </div>

        {error && (
          <div className="agency-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="agency-form">
          <div className="agency-form-group">
            <label className="agency-label">
              Agency Name *
            </label>
            <input
              type="text"
              value={formData.agencyName}
              onChange={(e) => handleInputChange('agencyName', e.target.value)}
              required
              className="agency-input"
              placeholder="Enter your agency name"
            />
          </div>

          <div className="agency-form-group">
            <label className="agency-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="agency-input agency-textarea"
              placeholder="Describe your agency (optional)"
            />
          </div>

          <div className="agency-form-group">
            <label className="agency-label">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="agency-input"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="agency-form-group-last">
            <label className="agency-label">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="agency-input agency-select"
            >
              <option value="">Select your industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
              <option value="Consulting">Consulting</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Legal">Legal</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.agencyName.trim()}
            className={`agency-button-primary ${loading ? 'agency-loading' : ''}`}
          >
            {loading ? 'Creating Agency...' : 'Create Agency'}
          </button>
        </form>

        <button
          onClick={handleBack}
          className="agency-button-secondary"
        >
          Back
        </button>

        <div className="agency-info-box agency-info-box-small">
          <p className="agency-info-text agency-info-text-center">
            💡 After creating your agency, you'll be able to invite team members and manage their calendars.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAgency;





























// import React, { useState } from 'react';
// import { supabase } from '../../lib/supabase';
// import { URLS } from '../../services/ApiServices';
// import { useNavigate } from 'react-router-dom';
// import './index.css';

// const CreateAgency = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     agencyName: '',
//     description: '',
//     website: '',
//     industry: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.agencyName.trim()) {
//       setError('Agency name is required');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession();

//       if (sessionError || !session?.user) {
//         setError('You must be logged in to create an agency');
//         return;
//       }

//       const response = await fetch(URLS.create_organization, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.access_token}`
//         },
//         body: JSON.stringify({
//           agencyName: formData.agencyName,
//           description: formData.description || null,
//           website: formData.website || null,
//           industry: formData.industry || null,
//           userId: session.user.id
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to create agency');
//       }

//       const data = await response.json();
//       console.log('Agency created:', data);
//       navigate('/dashboard'); // Redirect to dashboard or agency page
//     } catch (err) {
//       console.error('Create agency error:', err);
//       setError(err.message || 'Failed to create agency. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleBack = () => {
//     window.history.back();
//   };

//   return (
//     <div className="agency-container">
//       <div className="agency-card">
//         <div className="agency-header">
//           <h1 className="agency-title">
//             🏢 Create Your Agency
//           </h1>
//           <p className="agency-subtitle agency-subtitle-small">
//             Set up your agency to manage team calendars
//           </p>
//         </div>

//         {error && (
//           <div className="agency-error">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="agency-form">
//           <div className="agency-form-group">
//             <label className="agency-label">
//               Agency Name *
//             </label>
//             <input
//               type="text"
//               value={formData.agencyName}
//               onChange={(e) => handleInputChange('agencyName', e.target.value)}
//               required
//               className="agency-input"
//               placeholder="Enter your agency name"
//             />
//           </div>

//           <div className="agency-form-group">
//             <label className="agency-label">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => handleInputChange('description', e.target.value)}
//               rows={3}
//               className="agency-input agency-textarea"
//               placeholder="Describe your agency (optional)"
//             />
//           </div>

//           <div className="agency-form-group">
//             <label className="agency-label">
//               Website
//             </label>
//             <input
//               type="url"
//               value={formData.website}
//               onChange={(e) => handleInputChange('website', e.target.value)}
//               className="agency-input"
//               placeholder="https://yourwebsite.com"
//             />
//           </div>

//           <div className="agency-form-group-last">
//             <label className="agency-label">
//               Industry
//             </label>
//             <select
//               value={formData.industry}
//               onChange={(e) => handleInputChange('industry', e.target.value)}
//               className="agency-input agency-select"
//             >
//               <option value="">Select your industry</option>
//               <option value="Technology">Technology</option>
//               <option value="Healthcare">Healthcare</option>
//               <option value="Finance">Finance</option>
//               <option value="Education">Education</option>
//               <option value="Marketing">Marketing</option>
//               <option value="Consulting">Consulting</option>
//               <option value="Real Estate">Real Estate</option>
//               <option value="Legal">Legal</option>
//               <option value="Non-Profit">Non-Profit</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !formData.agencyName.trim()}
//             className={`agency-button-primary ${loading ? 'agency-loading' : ''}`}
//           >
//             {loading ? 'Creating Agency...' : 'Create Agency'}
//           </button>
//         </form>

//         <button
//           onClick={handleBack}
//           className="agency-button-secondary"
//         >
//           Back
//         </button>

//         <div className="agency-info-box agency-info-box-small">
//           <p className="agency-info-text agency-info-text-center">
//             💡 After creating your agency, you'll be able to invite team members and manage their calendars.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAgency;
