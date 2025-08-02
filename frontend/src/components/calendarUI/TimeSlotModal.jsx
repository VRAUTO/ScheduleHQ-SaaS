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

          {/* Selected Time Slots Section - Show selected slots here */}
          {selectedTimeSlots.length > 0 && (
            <div className="selected-slots-section">
              <h3 className="selected-slots-title">
                📅 Your Selected Time Slots ({selectedTimeSlots.length})
              </h3>
              <p><small>These are your currently selected slots. Click any to remove it.</small></p>
              <div className="selected-slots-grid">
                {selectedTimeSlots.map((timeValue) => {
                  const slot = timeSlots.find(s => s.value === timeValue);
                  return (
                    <button
                      key={`selected-${timeValue}`}
                      onClick={() => handleToggleTimeSlot(timeValue)}
                      disabled={saving}
                      className="selected-slot-button"
                      title="Click to remove this time slot"
                    >
                      {slot ? slot.display : timeValue}
                      <span className="remove-icon">×</span>
                    </button>
                  );
                })}
              </div>
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

          {/* Available Time Slots Section - Show only NON-selected slots */}
          <div className="available-slots-section">
            <h3 className="available-slots-title">
              ⏰ Available Time Slots
            </h3>
            <p><small>Click on any time slot below to add it to your selected slots:</small></p>
            <div className="time-slots-grid">
              {timeSlots
                .filter(slot => !selectedTimeSlots.includes(slot.value)) // Only show unselected slots
                .map((slot) => (
                  <button
                    key={`available-${slot.value}`}
                    onClick={() => handleToggleTimeSlot(slot.value)}
                    disabled={saving}
                    className="time-slot-button available"
                    title="Click to add this time slot"
                  >
                    {slot.display}
                  </button>
                ))}
            </div>
            {timeSlots.filter(slot => !selectedTimeSlots.includes(slot.value)).length === 0 && (
              <p className="no-slots-message">🎉 All time slots have been selected!</p>
            )}
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
