import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  closeTimeSlotModal,
  toggleTimeSlot,
  selectAllTimeSlots,
  clearAllTimeSlots,
  saveUserAvailability
} from '../../redux/calendarSlice';
import './TimeSlotModal.css';

const TimeSlotModal = () => {
  const dispatch = useDispatch();
  const { timeSlotModal, selectedDate } = useSelector(state => state.calendar);
  const { isOpen, selectedTimeSlots, saving, error } = timeSlotModal;

  // Generate time slots from 6 AM to 10 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        display: time12,
        value: time24,
        hour: hour
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleToggleTimeSlot = (timeValue) => {
    dispatch(toggleTimeSlot(timeValue));
  };

  const handleSelectAll = () => {
    dispatch(selectAllTimeSlots());
  };

  const handleClearAll = () => {
    dispatch(clearAllTimeSlots());
  };

  const handleSave = () => {
    const date = new Date(selectedDate);
    dispatch(saveUserAvailability({ date, timeSlots: selectedTimeSlots }));
  };

  const handleClose = () => {
    dispatch(closeTimeSlotModal());
  };

  if (!isOpen) return null;

  const selectedDateObj = new Date(selectedDate);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            Set Availability for {selectedDateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
          <button onClick={handleClose} className="modal-close-button" disabled={saving}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-description">
            <p>Select the hours when you're available for meetings:</p>
          </div>

          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button onClick={handleSelectAll} className="modal-action-button select-all" disabled={saving}>
              Select All
            </button>
            <button onClick={handleClearAll} className="modal-action-button clear-all" disabled={saving}>
              Clear All
            </button>
            <span className="selected-count">
              {selectedTimeSlots.length} slots selected
            </span>
          </div>

          <div className="time-slots-grid">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => handleToggleTimeSlot(slot.value)}
                disabled={saving}
                className={`time-slot-button ${selectedTimeSlots.includes(slot.value) ? 'selected' : ''
                  }`}
              >
                {slot.display}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={handleClose}
            className="modal-button cancel"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="modal-button save"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;
