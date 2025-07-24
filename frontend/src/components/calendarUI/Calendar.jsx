import React, { useState } from 'react';
import './index.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get calendar data
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

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
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
              Calendar
            </h1>
          </div>

          <div className="calendar-header-right">
            <button className="calendar-new-event-button">
              + New Event
            </button>
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
                onClick={() => setCurrentDate(today)}
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
            {calendarDays.map((dayObj, index) => (
              <div
                key={index}
                onClick={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.date)}
                className={`calendar-day ${dayObj.isCurrentMonth ? 'current-month' : 'other-month'} ${isSelected(dayObj.date) ? 'selected' : ''}`}
              >
                <div
                  className={`calendar-day-number ${dayObj.isCurrentMonth ? 'current-month' : 'other-month'} ${isToday(dayObj.date) ? 'today' : ''} ${isSelected(dayObj.date) ? 'selected' : ''}`}
                >
                  {dayObj.day}
                </div>

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
            ))}
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
                Available Time Slots
              </p>

              {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                <button
                  key={time}
                  className="calendar-time-slot"
                >
                  {time}
                </button>
              ))}
            </div>

            <button className="calendar-book-button">
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
