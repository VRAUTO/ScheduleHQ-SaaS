import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

// Async thunk for fetching user availability
export const fetchMonthAvailability = createAsyncThunk(
  'calendar/fetchMonthAvailability',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('user_availability')
        .select('date, start_time, end_time')
        .eq('user_id', session.user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_available', true);

      if (error) {
        throw error;
      }

      // Group availability by date
      const availabilityMap = {};
      data.forEach(slot => {
        if (!availabilityMap[slot.date]) {
          availabilityMap[slot.date] = [];
        }
        availabilityMap[slot.date].push({
          start: slot.start_time,
          end: slot.end_time
        });
      });

      return availabilityMap;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for saving user availability
export const saveUserAvailability = createAsyncThunk(
  'calendar/saveUserAvailability',
  async ({ date, timeSlots }, { rejectWithValue }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const dateStr = date.toISOString().split('T')[0];

      // First, delete existing availability for this date
      await supabase
        .from('user_availability')
        .delete()
        .eq('user_id', session.user.id)
        .eq('date', dateStr);

      // Then insert new availability slots
      if (timeSlots.length > 0) {
        const availabilityData = timeSlots.map(timeSlot => ({
          user_id: session.user.id,
          date: dateStr,
          start_time: timeSlot,
          end_time: `${(parseInt(timeSlot.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
          is_available: true
        }));

        const { error } = await supabase
          .from('user_availability')
          .insert(availabilityData);

        if (error) {
          throw error;
        }
      }

      return { date: dateStr, timeSlots };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    // Calendar view state (keeping existing functionality)
    currentDate: new Date().toISOString(),
    selectedDate: new Date().toISOString(),
    view: 'month',

    // Availability data
    userAvailability: {}, // { '2024-12-25': [{ start: '09:00', end: '10:00' }] }
    availabilityLoading: false,
    availabilityError: null,

    // Time slot modal state
    timeSlotModal: {
      isOpen: false,
      selectedTimeSlots: [],
      saving: false,
      error: null
    }
  },
  reducers: {
    // Calendar navigation actions
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setView: (state, action) => {
      state.view = action.payload;
    },

    // Time slot modal actions
    openTimeSlotModal: (state, action) => {
      state.timeSlotModal.isOpen = true;
      const dateStr = new Date(state.selectedDate).toISOString().split('T')[0];
      const existingSlots = state.userAvailability[dateStr] || [];
      state.timeSlotModal.selectedTimeSlots = existingSlots.map(slot => slot.start);
      state.timeSlotModal.error = null;
    },
    closeTimeSlotModal: (state) => {
      state.timeSlotModal.isOpen = false;
      state.timeSlotModal.selectedTimeSlots = [];
      state.timeSlotModal.saving = false;
      state.timeSlotModal.error = null;
    },
    toggleTimeSlot: (state, action) => {
      const timeSlot = action.payload;
      const index = state.timeSlotModal.selectedTimeSlots.indexOf(timeSlot);
      if (index >= 0) {
        state.timeSlotModal.selectedTimeSlots.splice(index, 1);
      } else {
        state.timeSlotModal.selectedTimeSlots.push(timeSlot);
        state.timeSlotModal.selectedTimeSlots.sort();
      }
    },
    selectAllTimeSlots: (state) => {
      // Generate all time slots from 6 AM to 10 PM
      const allSlots = [];
      for (let hour = 6; hour < 22; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
      state.timeSlotModal.selectedTimeSlots = allSlots;
    },
    clearAllTimeSlots: (state) => {
      state.timeSlotModal.selectedTimeSlots = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch availability cases
      .addCase(fetchMonthAvailability.pending, (state) => {
        state.availabilityLoading = true;
        state.availabilityError = null;
      })
      .addCase(fetchMonthAvailability.fulfilled, (state, action) => {
        state.availabilityLoading = false;
        state.userAvailability = action.payload;
      })
      .addCase(fetchMonthAvailability.rejected, (state, action) => {
        state.availabilityLoading = false;
        state.availabilityError = action.payload;
      })

      // Save availability cases
      .addCase(saveUserAvailability.pending, (state) => {
        state.timeSlotModal.saving = true;
        state.timeSlotModal.error = null;
      })
      .addCase(saveUserAvailability.fulfilled, (state, action) => {
        state.timeSlotModal.saving = false;
        const { date, timeSlots } = action.payload;

        // Update local availability state
        if (timeSlots.length > 0) {
          state.userAvailability[date] = timeSlots.map(slot => ({
            start: slot,
            end: `${(parseInt(slot.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
          }));
        } else {
          delete state.userAvailability[date];
        }
      })
      .addCase(saveUserAvailability.rejected, (state, action) => {
        state.timeSlotModal.saving = false;
        state.timeSlotModal.error = action.payload;
      });
  }
});

export const {
  setCurrentDate,
  setSelectedDate,
  setView,
  openTimeSlotModal,
  closeTimeSlotModal,
  toggleTimeSlot,
  selectAllTimeSlots,
  clearAllTimeSlots
} = calendarSlice.actions;

export default calendarSlice.reducer;
