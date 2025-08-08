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

  const fetchMemberInfo = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: member, error } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', memberId)
        .single();

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
    try {
      const { supabase } = await import('../../lib/supabase');
      // Fetch availability for the specific member
      const { data: availability, error } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', memberId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error fetching member availability:', error);
        return;
      }

      // Convert to the format expected by the calendar
      const availabilityMap = {};
      availability?.forEach(slot => {
        const dateStr = slot.date;
        if (!availabilityMap[dateStr]) {
          availabilityMap[dateStr] = [];
        }
        availabilityMap[dateStr].push(slot);
      });

      setMemberAvailability(availabilityMap);
    } catch (error) {
      console.error('Error:', error);
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

  // Handle date click to open modal (only for owner calendar)
  const handleDateClick = (dayObj) => {
    if (dayObj.isCurrentMonth && !isViewingMember) {
      setSelectedDateLocal(dayObj.date);
      dispatch(setSelectedDate(dayObj.date.toISOString()));
      dispatch(openTimeSlotModal());
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

        {/* Calendar Container */}
        <div className="calendar-main">
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
                  onClick={() => handleDateClick(dayObj)}
                  className={`calendar-day ${dayObj.isCurrentMonth ? 'current-month' : 'other-month'} ${!isViewingMember && dayObj.isCurrentMonth ? 'clickable' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                >
                  <div
                    className={`calendar-day-number ${dayObj.isCurrentMonth ? 'current-month' : 'other-month'} ${isToday(dayObj.date) ? 'today' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                  >
                    {dayObj.day}
                  </div>

                  {/* Show availability indicator */}
                  {dayObj.isCurrentMonth && availability.length > 0 && (
                    <div className="availability-indicator">
                      <span className="availability-badge">
                        {availability.length} slots
                      </span>
                    </div>
                  )}

                  {/* Event dots placeholder */}
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
        <div className="calendar-sidebar-container">
          <div></div>
          <div className="calendar-sidebar">
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
                <div style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    margin: '0 0 8px'
                  }}>
                    Viewing {memberInfo?.name || memberEmail}'s availability
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    margin: 0
                  }}>
                    You cannot edit this calendar
                  </p>
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
      </div>

      {/* Time Slot Modal - Only show for owner calendar */}
      {!isViewingMember && <TimeSlotModal />}
    </div>
  );
};

export default Calendar;
