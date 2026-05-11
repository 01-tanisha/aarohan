import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");
const ALLOWED_BANASTHALI_DOMAINS = ['banasthali.in', 'banasthali.ac.in'];

const Register = () => {
  const navigate = useNavigate();

 
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hostels, setHostels] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [studentData, setStudentData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    classroom: '',
    semester: '',
    smartCardId: '',
    rollNo: '',
    fatherName: '',
    motherName: '',
    mobileNo: '',
    hostel: '',
    photo: null,
    email: '',
    password: '',
    confirmPassword: '',
  });


  const [teacherData, setTeacherData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    smartCardId: '',
    mobileNo: '',
    email: '',
    specialization: '',
    password: '',
    confirmPassword: '',
  });

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} can only contain letters`;
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateMobile = (mobile) => {
    if (!mobile) return 'Mobile number is required';
    if (!/^\d{10}$/.test(mobile)) return 'Mobile number must be exactly 10 digits';
    return '';
  };

  const validateDOB = (dob) => {
    if (!dob) return 'Date of birth is required';
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 16) return 'You must be at least 16 years old';
    if (age > 100) return 'Please enter a valid date of birth';
    return '';
  };

  const validateSemester = (semester) => {
    if (!semester) return 'Semester is required';
    const sem = parseInt(semester);
    if (isNaN(sem) || sem < 1 || sem > 10) return 'Semester must be between 1 and 10';
    return '';
  };

  const validateRollNo = (rollNo) => {
    if (!rollNo.trim()) return 'Roll number is required';
    if (rollNo.length < 3) return 'Roll number must be at least 3 characters';
    return '';
  };

  const validateSmartCardId = (id) => {
    if (!id.trim()) return 'Smart Card ID is required';
    if (!/^[A-Z]{5}\d{5}$/.test(id)) {
      return 'Smart Card ID must be 5 uppercase letters followed by 5 digits (e.g., XXXXX12345)';
    }
    return '';
  };

  const validateSelect = (value, fieldName) => {
    if (!value) return `Please select a ${fieldName}`;
    return '';
  };

  const validatePhoto = (photo) => {
    if (!photo) return 'Photo is required';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(photo.type)) return 'Only JPG, JPEG, and PNG files are allowed';
    if (photo.size > 2 * 1024 * 1024) return 'Photo size must be less than 2MB';
    return '';
  };

  useEffect(() => {
    console.log('Register useEffect running');

    fetch(`${API_BASE}/api/hostels/`)
      .then(res => res.json())
      .then(data => {
        console.log('HOSTELS:', data);
        setHostels(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Hostel fetch error:', err);
        setHostels([]);
      });

    fetch(`${API_BASE}/api/classrooms/`)
      .then(res => res.json())
      .then(data => {
        console.log('CLASSROOMS:', data);
        setClassrooms(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Classroom fetch error:', err);
        setClassrooms([]);
      });

    fetch(`${API_BASE}/api/activities/`)
      .then(res => res.json())
      .then(data => {
        setActivities(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Activities fetch error:', err);
        setActivities([]);
      });
  }, []);

 
  const handleStudentChange = (e) => {
    const { name, value, type, files } = e.target;
    let newValue = type === 'file' ? files[0] : value;

    if (name === 'smartCardId' && type !== 'file') {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }

    setStudentData(prev => ({
      ...prev,
      [name]: newValue,
    }));
    if (name === 'email') {
      setOtp('');
      setOtpSessionId('');
      setOtpSent(false);
      setOtpVerified(false);
    }
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTeacherChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'smartCardId') {
      nextValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
    setTeacherData(prev => ({ ...prev, [name]: nextValue }));
    if (name === 'email') {
      setOtp('');
      setOtpSessionId('');
      setOtpSent(false);
      setOtpVerified(false);
    }
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');

    const email = role === 'student' ? studentData.email : teacherData.email;
    const username = email ? email.split('@')[0] : '';

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const emailDomain = (email.split('@')[1] || '').toLowerCase();
    if (!ALLOWED_BANASTHALI_DOMAINS.includes(emailDomain)) {
      setError('Only banasthali email is allowed');
      return;
    }

    setSendingOtp(true);
    try {
      const otpRes = await fetch(`${API_BASE}/api/register/request-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          email,
          username,
        }),
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        setError(otpData.error || 'Failed to send OTP.');
        return;
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtpSessionId(otpData.otp_session_id || '');
      setSuccess('OTP sent to your email.');
    } catch {
      setError('Could not send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');

    const email = role === 'student' ? studentData.email : teacherData.email;
    const username = email ? email.split('@')[0] : '';

    if (!otpSent || !otpSessionId) {
      setError('Please click Send OTP first.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/api/register/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          email,
          username,
          otp,
          otp_session_id: otpSessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'OTP verification failed.');
        return;
      }

      setOtpVerified(true);
      setSuccess('OTP verified successfully. Now set your password and register.');
    } catch {
      setError('Could not verify OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleStudentBlur = (e) => {
    const { name, value, type, files } = e.target;
    let errorMsg = '';
    
    switch (name) {
      case 'firstName': errorMsg = validateName(value, 'First name'); break;
      case 'lastName': errorMsg = validateName(value, 'Last name'); break;
      case 'fatherName': errorMsg = validateName(value, "Father's name"); break;
      case 'motherName': errorMsg = validateName(value, "Mother's name"); break;
      case 'email': errorMsg = validateEmail(value); break;
      case 'password': errorMsg = validatePassword(value); break;
      case 'confirmPassword': errorMsg = validateConfirmPassword(studentData.password, value); break;
      case 'mobileNo': errorMsg = validateMobile(value); break;
      case 'dob': errorMsg = validateDOB(value); break;
      case 'semester': errorMsg = validateSemester(value); break;
      case 'rollNo': errorMsg = validateRollNo(value); break;
      case 'smartCardId': errorMsg = validateSmartCardId(value); break;
      case 'classroom': errorMsg = validateSelect(value, 'course'); break;
      case 'hostel': errorMsg = validateSelect(value, 'hostel'); break;
      case 'photo': errorMsg = type === 'file' && files[0] ? validatePhoto(files[0]) : ''; break;
      default: break;
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleTeacherBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = '';
    
    switch (name) {
      case 'firstName': errorMsg = validateName(value, 'First name'); break;
      case 'lastName': errorMsg = validateName(value, 'Last name'); break;
      case 'email': errorMsg = validateEmail(value); break;
      case 'password': errorMsg = validatePassword(value); break;
      case 'confirmPassword': errorMsg = validateConfirmPassword(teacherData.password, value); break;
      case 'mobileNo': errorMsg = validateMobile(value); break;
      case 'dob': errorMsg = validateDOB(value); break;
      case 'smartCardId': errorMsg = validateSmartCardId(value); break;
      case 'specialization': errorMsg = validateSelect(value, 'specialization'); break;
      default: break;
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const validateStudentForm = () => {
    const errors = {};
    errors.firstName = validateName(studentData.firstName, 'First name');
    errors.lastName = validateName(studentData.lastName, 'Last name');
    errors.fatherName = validateName(studentData.fatherName, "Father's name");
    errors.motherName = validateName(studentData.motherName, "Mother's name");
    errors.email = validateEmail(studentData.email);
    errors.password = validatePassword(studentData.password);
    errors.confirmPassword = validateConfirmPassword(studentData.password, studentData.confirmPassword);
    errors.mobileNo = validateMobile(studentData.mobileNo);
    errors.dob = validateDOB(studentData.dob);
    errors.semester = validateSemester(studentData.semester);
    errors.rollNo = validateRollNo(studentData.rollNo);
    errors.smartCardId = validateSmartCardId(studentData.smartCardId);
    errors.classroom = validateSelect(studentData.classroom, 'course');
    errors.hostel = validateSelect(studentData.hostel, 'hostel');
    if (studentData.photo) {
      errors.photo = validatePhoto(studentData.photo);
    } else {
      errors.photo = 'Photo is required';
    }
    
    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, v]) => v !== '')
    );
    
    setFieldErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const validateTeacherForm = () => {
    const errors = {};
    errors.firstName = validateName(teacherData.firstName, 'First name');
    errors.lastName = validateName(teacherData.lastName, 'Last name');
    errors.email = validateEmail(teacherData.email);
    errors.password = validatePassword(teacherData.password);
    errors.confirmPassword = validateConfirmPassword(teacherData.password, teacherData.confirmPassword);
    errors.mobileNo = validateMobile(teacherData.mobileNo);
    errors.dob = validateDOB(teacherData.dob);
    errors.smartCardId = validateSmartCardId(teacherData.smartCardId);
    errors.specialization = validateSelect(teacherData.specialization, 'specialization');
    
    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, v]) => v !== '')
    );
    
    setFieldErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  const email = role === 'student' ? studentData.email : teacherData.email;

  const emailOnlyError = validateEmail(email);
  if (emailOnlyError) {
    setError(emailOnlyError);
    return;
  }

  // ✅ Email restriction
  const emailDomain = (email.split('@')[1] || '').toLowerCase();
  if (!ALLOWED_BANASTHALI_DOMAINS.includes(emailDomain)) {
    alert("Only banasthali email is allowed");
    return;
  }

  if (!otpVerified || !otpSessionId) {
    setError('Please verify OTP first.');
    return;
  }

  const isValid = role === 'student' ? validateStudentForm() : validateTeacherForm();
  if (!isValid) {
    setError('Please fix the errors above before submitting.');
    return;
  }

    setLoading(true);

    const formData = new FormData();
    formData.append('role', role);
    formData.append('otp_session_id', otpSessionId);

    if (role === 'student') {
      formData.append('username', studentData.email.split('@')[0]);
      formData.append('email', studentData.email);
      formData.append('password', studentData.password);

      // Canonical name fields used by backend profile model
      formData.append('firstName', studentData.firstName);
      formData.append('middleName', studentData.middleName);
      formData.append('lastName', studentData.lastName);

      formData.append(
        'studentName',
        `${studentData.firstName} ${studentData.middleName} ${studentData.lastName}`.trim()
      );

      formData.append('rollNo', studentData.rollNo);
      formData.append('semester', studentData.semester);
      formData.append('mobileNo', studentData.mobileNo);
      formData.append('studentMobNo', studentData.mobileNo);
      formData.append('fatherName', studentData.fatherName);
      formData.append('motherName', studentData.motherName);
      formData.append('fathersName', studentData.fatherName);
      formData.append('mothersName', studentData.motherName);
      formData.append('dob', studentData.dob);

      // Foreign Keys
      formData.append('classroom', studentData.classroom);
      formData.append('hostel', studentData.hostel);

      formData.append('smartCardId', studentData.smartCardId);

      if (studentData.photo) {
        formData.append('photo', studentData.photo);
      }
    } else {
      formData.append('username', teacherData.email.split('@')[0]);
      formData.append('email', teacherData.email);
      formData.append('password', teacherData.password);

      formData.append(
        'teacherName',
        `${teacherData.firstName} ${teacherData.middleName} ${teacherData.lastName}`.trim()
      );

      formData.append('teacherMobNo', teacherData.mobileNo);
      formData.append('dob', teacherData.dob);
      formData.append('specialization', teacherData.specialization);
    }

    try {
      const response = await fetch(`${API_BASE}/api/register/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);
        setOtpSessionId('');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Network error. Backend server not running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-body">
      <div className="register-container">
        <div className="register-hat">🎓</div>
        <h2>Create Account</h2>

        <div className="register-role">
          <button
            type="button"
            className={role === 'student' ? 'active' : ''}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={role === 'teacher' ? 'active' : ''}
            onClick={() => setRole('teacher')}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'student' && (
            <div className="register-section active">
              <div className="register-flex">
                <div className="input-group">
                  <input name="firstName" placeholder="First Name" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.firstName ? 'input-error' : ''} required />
                  {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
                </div>
                <input name="middleName" placeholder="Middle Name (Optional)" onChange={handleStudentChange} />
                <div className="input-group">
                  <input name="lastName" placeholder="Last Name" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.lastName ? 'input-error' : ''} required />
                  {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
                </div>
              </div>
              
              <div className="input-group">
                <input type="date" name="dob" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.dob ? 'input-error' : ''} required />
                {fieldErrors.dob && <span className="field-error">{fieldErrors.dob}</span>}
              </div>

              <div className="input-group">
                <select name="classroom" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.classroom ? 'input-error' : ''} required>
                  <option value="">Select Course</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {fieldErrors.classroom && <span className="field-error">{fieldErrors.classroom}</span>}
              </div>

              <div className="input-group">
                <input name="semester" placeholder="Semester (1-10)" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.semester ? 'input-error' : ''} required />
                {fieldErrors.semester && <span className="field-error">{fieldErrors.semester}</span>}
              </div>

              <div className="input-group">
                <input name="smartCardId" placeholder="Smart Card ID (XXXXX12345)" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.smartCardId ? 'input-error' : ''} maxLength={10} required />
                {fieldErrors.smartCardId && <span className="field-error">{fieldErrors.smartCardId}</span>}
              </div>

              <div className="input-group">
                <input name="rollNo" placeholder="Roll No" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.rollNo ? 'input-error' : ''} required />
                {fieldErrors.rollNo && <span className="field-error">{fieldErrors.rollNo}</span>}
              </div>

              <div className="input-group">
                <input name="fatherName" placeholder="Father's Name" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.fatherName ? 'input-error' : ''} required />
                {fieldErrors.fatherName && <span className="field-error">{fieldErrors.fatherName}</span>}
              </div>

              <div className="input-group">
                <input name="motherName" placeholder="Mother's Name" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.motherName ? 'input-error' : ''} required />
                {fieldErrors.motherName && <span className="field-error">{fieldErrors.motherName}</span>}
              </div>

              <div className="input-group">
                <input name="mobileNo" placeholder="Mobile No (10 digits)" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.mobileNo ? 'input-error' : ''} required />
                {fieldErrors.mobileNo && <span className="field-error">{fieldErrors.mobileNo}</span>}
              </div>

              <div className="input-group">
                <select name="hostel" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.hostel ? 'input-error' : ''} required>
                  <option value="">Select Hostel</option>
                  {hostels.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                {fieldErrors.hostel && <span className="field-error">{fieldErrors.hostel}</span>}
              </div>

              <div className="input-group">
                <input type="file" name="photo" accept="image/*" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.photo ? 'input-error' : ''} required />
                {fieldErrors.photo && <span className="field-error">{fieldErrors.photo}</span>}
              </div>

              <div className="input-group">
                <input type="email" name="email" placeholder="Email" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.email ? 'input-error' : ''} required />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>

              <div className="input-group">
                <button type="button" className="otp-send-btn" onClick={handleSendOtp} disabled={sendingOtp}>
                  {sendingOtp ? 'Sending OTP...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>

              {otpSent && (
                <div className="input-group">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
              )}

              {otpSent && !otpVerified && (
                <div className="input-group">
                  <button type="button" className="otp-send-btn" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                    {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
                  </button>
                </div>
              )}

              {otpVerified && (
                <>
                  <div className="input-group">
                    <input type="password" name="password" placeholder="Password (min 8 chars, uppercase, lowercase, number, special)" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.password ? 'input-error' : ''} required />
                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                  </div>

                  <div className="input-group">
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleStudentChange} onBlur={handleStudentBlur} className={fieldErrors.confirmPassword ? 'input-error' : ''} required />
                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                  </div>
                </>
              )}
            </div>
          )}

          {role === 'teacher' && (
            <div className="register-section active">
              <div className="register-flex">
                <div className="input-group">
                  <input name="firstName" placeholder="First Name" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.firstName ? 'input-error' : ''} required />
                  {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
                </div>
                <input name="middleName" placeholder="Middle Name (Optional)" onChange={handleTeacherChange} />
                <div className="input-group">
                  <input name="lastName" placeholder="Last Name" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.lastName ? 'input-error' : ''} required />
                  {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
                </div>
              </div>
              
              <div className="input-group">
                <input type="date" name="dob" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.dob ? 'input-error' : ''} required />
                {fieldErrors.dob && <span className="field-error">{fieldErrors.dob}</span>}
              </div>

              <div className="input-group">
                <input name="smartCardId" placeholder="Smart Card ID (XXXXX12345)" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.smartCardId ? 'input-error' : ''} maxLength={10} required />
                {fieldErrors.smartCardId && <span className="field-error">{fieldErrors.smartCardId}</span>}
              </div>

              <div className="input-group">
                <input name="mobileNo" placeholder="Mobile No (10 digits)" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.mobileNo ? 'input-error' : ''} required />
                {fieldErrors.mobileNo && <span className="field-error">{fieldErrors.mobileNo}</span>}
              </div>

              <div className="input-group">
                <input type="email" name="email" placeholder="Email" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.email ? 'input-error' : ''} required />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>

              <div className="input-group">
                <select name="specialization" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.specialization ? 'input-error' : ''} required>
                  <option value="">Select Specialization (Activity)</option>
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {fieldErrors.specialization && <span className="field-error">{fieldErrors.specialization}</span>}
              </div>

              <div className="input-group">
                <button type="button" className="otp-send-btn" onClick={handleSendOtp} disabled={sendingOtp}>
                  {sendingOtp ? 'Sending OTP...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>

              {otpSent && (
                <div className="input-group">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
              )}

              {otpSent && !otpVerified && (
                <div className="input-group">
                  <button type="button" className="otp-send-btn" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                    {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
                  </button>
                </div>
              )}

              {otpVerified && (
                <>
                  <div className="input-group">
                    <input type="password" name="password" placeholder="Password (min 8 chars, uppercase, lowercase, number, special)" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.password ? 'input-error' : ''} required />
                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                  </div>

                  <div className="input-group">
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleTeacherChange} onBlur={handleTeacherBlur} className={fieldErrors.confirmPassword ? 'input-error' : ''} required />
                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                  </div>
                </>
              )}
            </div>
          )}

          {error && <div className="register-error">{error}</div>}
          {success && <div className="register-success">{success}</div>}

          <button type="submit" className="register-submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

