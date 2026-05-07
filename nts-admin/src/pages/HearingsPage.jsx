import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField
} from "@mui/material";

import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { hearingsAPI } from "../api/services";

export default function HearingsPage() {
  const { caseId } = useParams();

  const [events, setEvents] = useState([]);

  // dialog states
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(dayjs().hour(10).minute(0));
  const [endTime, setEndTime] = useState(dayjs().hour(11).minute(0));
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchHearings();
  }, [caseId]);

  const fetchHearings = async () => {
    try {
      const res = await hearingsAPI.getAll({ case: caseId });

      const formatted = res.data.map((h) => ({
        id: h.id,
        title: h.title,
        start: `${h.date}T${h.start_time}`,
        end: `${h.date}T${h.end_time}`,
      }));

      setEvents(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  // 👉 Click date → Add
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setTitle("");
    setStartTime(dayjs().hour(10).minute(0));
    setEndTime(dayjs().hour(11).minute(0));
    setEditingId(null);
    setOpen(true);
  };

  // 👉 Click event → Edit
  const handleEventClick = (info) => {
    const event = info.event;

    setEditingId(event.id);
    setTitle(event.title);
    setSelectedDate(event.startStr.split("T")[0]);
    setStartTime(dayjs(event.start));
    setEndTime(dayjs(event.end));
    setOpen(true);
  };

  // 👉 Save / Update
  const handleSave = async () => {
    const payload = {
      title,
      date: selectedDate,
      start_time: startTime.format("HH:mm:ss"),
      end_time: endTime.format("HH:mm:ss"),
      court_name: "Court",
      case: caseId,
    };

    try {
      if (editingId) {
        await hearingsAPI.update(editingId, payload);
      } else {
        await hearingsAPI.create(payload);
      }

      setOpen(false);
      fetchHearings();
    } catch (err) {
      console.error(err);
    }
  };

  // 👉 Delete
  const handleDelete = async () => {
    if (!editingId) return;

    try {
      await hearingsAPI.delete(editingId);
      setOpen(false);
      fetchHearings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Hearing Calendar (Case #{caseId})</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="80vh"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      {/* Dialog */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            {editingId ? "Edit Hearing" : "Add Hearing"}
          </DialogTitle>

          <DialogContent>
            <TextField
              label="Date"
              fullWidth
              value={selectedDate}
              disabled
              sx={{ mt: 2 }}
            />

            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mt: 2 }}
            />

            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              sx={{ mt: 2, width: "100%" }}
            />

            <TimePicker
              label="End Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              sx={{ mt: 2, width: "100%" }}
            />
          </DialogContent>

          <DialogActions>
            {editingId && (
              <Button color="error" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </div>
  );
}