import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentDate,
  setSelectedDate,
  openTimeSlotModal,
  fetchMonthAvailability
} from '../../redux/calendarSlice';
import TimeSlotModal from './TimeSlotModal';
import './index.css';

const Calendar = () => {
  const dispatch = useDispatch();

  // Get URL parameters to check if viewing a member's calendar
  const urlParams = new URLSearchParams(window.location.search);
  const memberId = urlParams.get('memberId');
  const memberEmail = urlParams.get('memberEmail');
  const viewMode = urlParams.get('view');
  const isViewingMember = viewMode === 'member' && memberId;

  // Debug URL parameters
  console.log('Calendar URL params:', {
    memberId,
    memberEmail,
    viewMode,
    isViewingMember,
    fullURL: window.location.href
  });

  // Redux state
  const { currentDate: reduxCurrentDate, selectedDate: reduxSelectedDate, userAvailability } = useSelector(state => state.calendar);

  // Local state for calendar calculations (preserving existing logic)
  const [currentDate, setCurrentDateLocal] = useState(new Date(reduxCurrentDate));
  const [selectedDate, setSelectedDateLocal] = useState(new Date(reduxSelectedDate));
  const [memberAvailability, setMemberAvailability] = useState({});
  const [memberInfo, setMemberInfo] = useState(null);

  // Sync Redux state with local state
  useEffect(() => {
    setCurrentDateLocal(new Date(reduxCurrentDate));
  }, [reduxCurrentDate]);

  useEffect(() => {
    setSelectedDateLocal(new Date(reduxSelectedDate));
  }, [reduxSelectedDate]);

  // Fetch member information when viewing member calendar
  useEffect(() => {
    if (isViewingMember) {
      fetchMemberInfo();
    }
  }, [isViewingMember, memberId]);

  // Debug effect to log when selected date changes
  useEffect(() => {
    if (isViewingMember) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const dayAvailability = memberAvailability[selectedDateStr] || [];
      console.log('Selected date changed:', selectedDateStr);
      console.log('Availability for new selected date:', dayAvailability);
      console.log('Total memberAvailability:', memberAvailability);
    }
  }, [selectedDate, isViewingMember, memberAvailability]);

  const fetchMemberInfo = async () => {
    console.log('Fetching member info for:', { memberId, memberEmail });

    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: member, error } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', memberId)
        .single();

      console.log('Member info query result:', { member, error });

      if (error) {
        console.error('Error fetching member info:', error);
        return;
      }

      setMemberInfo(member);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMemberAvailability = async (startDate, endDate) => {
    console.log('=== FETCHING MEMBER AVAILABILITY ===');
    console.log('Parameters:', {
      memberId,
      memberEmail,
      startDate,
      endDate,
      isViewingMember
    });

    if (!memberId) {
      console.error('No memberId provided');
      return;
    }

    try {
      // First, let's try to fetch through backend API
      console.log('Trying backend API approach...');

      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`http://localhost:5000/api/member-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          memberId,
          startDate,
          endDate
        })
      });

      if (response.ok) {
        const availability = await response.json();
        console.log('Backend API success:', availability);

        // Process the data
        const availabilityMap = {};
        availability.forEach(slot => {
          const dateStr = slot.date;
          if (!availabilityMap[dateStr]) {
            availabilityMap[dateStr] = [];
          }

          const startTime = slot.start_time.includes(':')
            ? slot.start_time.substring(0, 5)
            : slot.start_time;
          const endTime = slot.end_time.includes(':')
            ? slot.end_time.substring(0, 5)
            : slot.end_time;

          availabilityMap[dateStr].push({
            start: startTime,
            end: endTime,
            ...slot
          });
        });

        console.log('Processed availability map:', availabilityMap);
        setMemberAvailability(availabilityMap);
        return;
      } else {
        const errorText = await response.text();
        console.log('Backend API failed:', response.status, errorText);
      }
    } catch (apiError) {
      console.log('Backend API error:', apiError);
      console.log('Falling back to direct Supabase query...');
    }

    try {
      // Direct Supabase approach
      const { supabase } = await import('../../lib/supabase');

      // Get current user info for debugging
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user?.id, userError);

      const { data: availability, error } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', memberId)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_available', true);

      console.log('Direct Supabase query result:', {
        data: availability,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null,
        memberId,
        count: availability?.length || 0
      });

      // If we get data, process it
      if (availability && availability.length > 0) {
        const availabilityMap = {};
        availability.forEach(slot => {
          const dateStr = slot.date;
          if (!availabilityMap[dateStr]) {
            availabilityMap[dateStr] = [];
          }

          const startTime = slot.start_time.includes(':')
            ? slot.start_time.substring(0, 5)
            : slot.start_time;
          const endTime = slot.end_time.includes(':')
            ? slot.end_time.substring(0, 5)
            : slot.end_time;

          availabilityMap[dateStr].push({
            start: startTime,
            end: endTime,
            ...slot
          });
        });

        console.log('SUCCESS: Processed member availability map:', availabilityMap);
        setMemberAvailability(availabilityMap);
        return;
      }

      // If error or no data, show helpful debugging info
      if (error) {
        console.error('❌ RLS or permission error:', error);

        // Create mock data to test UI
        console.log('Creating mock data for UI testing...');
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const mockAvailability = {
          [todayStr]: [
            { start: '09:00', end: '10:00', id: 'mock-1' },
            { start: '14:00', end: '15:00', id: 'mock-2' },
            { start: '16:00', end: '17:00', id: 'mock-3' }
          ],
          [tomorrowStr]: [
            { start: '10:00', end: '11:00', id: 'mock-4' },
            { start: '15:00', end: '16:00', id: 'mock-5' }
          ]
        };

        console.log('Using mock availability:', mockAvailability);
        setMemberAvailability(mockAvailability);
      } else {
        console.log('No availability data found for member');
        setMemberAvailability({});
      }

    } catch (error) {
      console.error('Error in fetchMemberAvailability:', error);
    }
  };

  // Get calendar data (preserving all existing logic)
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months (now updates Redux)
  const previousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDateLocal(newDate);
    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const nextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDateLocal(newDate);
    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDateLocal(today);
    dispatch(setCurrentDate(today.toISOString()));
  };

  // Fetch availability when month changes
  useEffect(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = endOfMonth.toISOString().split('T')[0];

    if (isViewingMember) {
      // Fetch member's availability
      fetchMemberAvailability(startDate, endDate);
    } else {
      // Fetch current user's availability (original behavior)
      dispatch(fetchMonthAvailability({
        startDate,
        endDate
      }));
    }
  }, [currentMonth, currentYear, dispatch, isViewingMember, memberId]);

  // Handle date click to open modal (for both owner and member calendars)
  const handleDateClick = (dayObj) => {
    if (dayObj.isCurrentMonth) {
      console.log('Date clicked:', dayObj.date, 'isViewingMember:', isViewingMember);
      setSelectedDateLocal(dayObj.date);
      dispatch(setSelectedDate(dayObj.date.toISOString()));

      // Debug: log the availability for this date
      if (isViewingMember) {
        const dateStr = dayObj.date.toISOString().split('T')[0];
        const dayAvailability = memberAvailability[dateStr] || [];
        console.log('Availability for selected date:', dateStr, dayAvailability);
        console.log('Current memberAvailability state:', memberAvailability);
      }

      // Only open the modal for editing if not viewing member calendar
      if (!isViewingMember) {
        dispatch(openTimeSlotModal());
      }
    }
  };

  // Get availability for a specific date
  const getAvailabilityForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (isViewingMember) {
      return memberAvailability[dateStr] || [];
    } else {
      return userAvailability[dateStr] || [];
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = new Date(currentYear, currentMonth - 1, 0);
      const day = prevMonth.getDate() - i;
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(currentYear, currentMonth - 1, day)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(currentYear, currentMonth, day)
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(currentYear, currentMonth + 1, day)
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const goBack = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        {/* Header */}
        <div className="calendar-header">
          <div className="calendar-header-left">
            <button
              onClick={goBack}
              className="calendar-back-button"
            >
              ← Back to Dashboard
            </button>
            <h1 className="calendar-title">
              {isViewingMember
                ? `${memberInfo?.name || memberEmail}'s Calendar`
                : 'Calendar'
              }
            </h1>
          </div>

          <div className="calendar-header-right">
            {!isViewingMember && (
              <button className="calendar-new-event-button">
                + New Event
              </button>
            )}
            {isViewingMember && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(102, 126, 234, 0.1)',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#667eea'
                }}>
                  👁️ Viewing Member Calendar
                </span>
              </div>
            )}
            <div className="calendar-view-toggle">
              <button className="calendar-view-button active">
                Month
              </button>
              <button className="calendar-view-button inactive">
                Week
              </button>
              <button className="calendar-view-button inactive">
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar and Sidebar Container */}
        <div className="calendar-content-container" style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          width: '100%'
        }}>
          {/* Calendar Container */}
          <div className="calendar-main" style={{ flex: 1 }}>
            {/* Calendar Header */}
            <div className="calendar-month-header">
              <h2 className="calendar-month-title">
                {monthNames[currentMonth]} {currentYear}
              </h2>

              <div className="calendar-navigation">
                <button
                  onClick={previousMonth}
                  className="calendar-nav-button"
                >
                  ←
                </button>
                <button
                  onClick={goToToday}
                  className="calendar-today-button"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="calendar-nav-button"
                >
                  →
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="calendar-day-headers">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="calendar-day-header"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {calendarDays.map((dayObj, index) => {
                const availability = getAvailabilityForDate(dayObj.date);
                return (
                  <div
                    key={index}
                    className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''
                      } ${dayObj.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                      } ${dayObj.date.toDateString() === new Date().toDateString() ? 'today' : ''
                      }`}
                    onClick={() => handleDateClick(dayObj)}
                  >
                    <span className="calendar-day-number">{dayObj.day}</span>
                    {availability.length > 0 && (
                      <div className="calendar-availability-indicator">
                        {availability.length} slot{availability.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="calendar-events">
                      {/* Sample events for demo */}
                      {dayObj.isCurrentMonth && dayObj.day % 7 === 0 && (
                        <div className="calendar-event team-meeting">
                          Team Meeting
                        </div>
                      )}
                      {dayObj.isCurrentMonth && dayObj.day % 5 === 0 && (
                        <div className="calendar-event client-call">
                          Client Call
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Slots Sidebar */}
          <div className="calendar-sidebar" style={{
            minWidth: '300px',
            maxWidth: '350px',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 className="calendar-sidebar-title">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>

            <div className="calendar-sidebar-section">
              <p className="calendar-sidebar-label">
                {isViewingMember ? 'Available Time Slots' : 'Available Time Slots'}
              </p>

              {isViewingMember ? (
                <div>
                  <div style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '0 0 4px'
                    }}>
                      Viewing {memberInfo?.name || memberEmail}'s availability
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      margin: 0
                    }}>
                      Read-only view
                    </p>
                  </div>

                  {/* Show actual member time slots for selected date */}
                  {(() => {
                    const selectedDateStr = selectedDate.toISOString().split('T')[0];
                    const dayAvailability = memberAvailability[selectedDateStr] || [];

                    console.log('Sidebar rendering - selectedDate:', selectedDateStr);
                    console.log('Sidebar rendering - dayAvailability:', dayAvailability);
                    console.log('Sidebar rendering - memberAvailability keys:', Object.keys(memberAvailability));

                    if (dayAvailability.length === 0) {
                      return (
                        <div style={{
                          padding: '16px',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '14px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px dashed #d1d5db'
                        }}>
                          No availability for {selectedDate.toLocaleDateString()}
                          <br />
                          <small style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            {Object.keys(memberAvailability).length > 0
                              ? `Available dates: ${Object.keys(memberAvailability).join(', ')}`
                              : 'No availability data loaded'
                            }
                          </small>
                        </div>
                      );
                    }

                    return (
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '8px',
                          textAlign: 'center'
                        }}>
                          {dayAvailability.length} available slots
                        </div>
                        {dayAvailability.map((slot, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '12px',
                              marginBottom: '8px',
                              background: '#e0f2fe',
                              border: '1px solid #0891b2',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#0e7490',
                              textAlign: 'center'
                            }}
                          >
                            {slot.start} - {slot.end}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                  <button
                    key={time}
                    className="calendar-time-slot"
                  >
                    {time}
                  </button>
                ))
              )}
            </div>

            {!isViewingMember && (
              <button className="calendar-book-button">
                Book Appointment
              </button>
            )}
          </div>
        </div>

        {/* Time Slot Modal - Only show for owner calendar */}
        {!isViewingMember && <TimeSlotModal />}
      </div>
    </div>
  );
};

export default Calendar;
