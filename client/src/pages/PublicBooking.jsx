import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { getLocalTimezone } from "../utils/timezone";
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  isAfter,
  isBefore,
} from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Send,
} from "lucide-react";

/**
 * PublicBooking — public booking page with calendar picker, time slots, and booking form
 * Route: /:username/:eventSlug
 * Includes the AI Smart Scheduling Assistant (LLM feature)
 */
export default function PublicBooking() {
  const { username, eventSlug } = useParams();
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timezone, setTimezone] = useState(getLocalTimezone());

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    guestName: "",
    guestEmail: "",
    guestNotes: "",
  });
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // AI Assistant state
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots();
  }, [selectedDate, timezone]);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await API.get(
        `/bookings/slots/${username}/${eventSlug}?date=${dateStr}&timezone=${timezone}`,
      );
      setSlots(res.data.slots);
      if (!eventType && res.data.eventType) setEventType(res.data.eventType);
    } catch (err) {
      if (err.response?.status === 404) setError("Event not found");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const res = await API.post("/bookings", {
        eventTypeId: eventType._id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        guestName: bookingForm.guestName,
        guestEmail: bookingForm.guestEmail,
        guestNotes: bookingForm.guestNotes,
        guestTimezone: timezone,
      });
      setBookingSuccess(res.data.booking);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // AI Smart Scheduling
  const handleAiSuggest = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await API.post("/llm/suggest-slots", {
        query: aiQuery,
        username,
        eventSlug,
        timezone,
      });
      setAiResult(res.data);
    } catch (err) {
      if (err.response?.data?.fallback) {
        setAiResult({
          error:
            "AI features are not configured. Please select a date manually.",
        });
      } else {
        setAiResult({
          error:
            "Could not process your request. Please try using the calendar.",
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const selectAiSlot = (slot) => {
    setSelectedDate(new Date(slot.startTime));
    setSelectedSlot(slot);
    if (eventType) {
    }
    setAiResult(null);
  };

  // Calendar rendering helpers
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = startOfDay(new Date());

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isPast = isBefore(date, today);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const isToday = isSameDay(date, today);

      days.push(
        <button
          key={d}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: isSelected ? 600 : 400,
            cursor: isPast ? "default" : "pointer",
            border: isToday ? "1px solid var(--primary)" : "none",
            background: isSelected ? "var(--primary)" : "transparent",
            color: isPast
              ? "var(--text-muted)"
              : isSelected
                ? "white"
                : "var(--text-primary)",
            opacity: isPast ? 0.4 : 1,
            transition: "var(--transition)",
          }}
        >
          {d}
        </button>,
      );
    }
    return days;
  };

  // Success screen
  if (bookingSuccess) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          className="glass-card animate-fadeInUp"
          style={{ padding: 48, textAlign: "center", maxWidth: 480 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle size={32} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Booking Confirmed!
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            Your meeting has been scheduled successfully.
          </p>
          <div
            style={{
              background: "var(--bg-dark)",
              borderRadius: "var(--radius)",
              padding: 16,
              textAlign: "left",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <strong>Event:</strong> {bookingSuccess.eventType?.title}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Date:</strong>{" "}
              {format(new Date(bookingSuccess.startTime), "EEE, MMM d, yyyy")}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Time:</strong>{" "}
              {format(new Date(bookingSuccess.startTime), "HH:mm")} -{" "}
              {format(new Date(bookingSuccess.endTime), "HH:mm")} ({timezone})
            </div>
            <div>
              <strong>Host:</strong> {bookingSuccess.host?.name}
            </div>
          </div>
          <Link to={`/${username}`} className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <h2>{error}</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "32px 24px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <Link
        to={`/${username}`}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Event Type Info */}
      {eventType && (
        <div
          className="glass-card animate-fadeIn"
          style={{ padding: 24, marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 4,
                height: 40,
                borderRadius: 4,
                background: eventType.color,
              }}
            />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>
                {eventType.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={13} /> {eventType.duration} min
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} /> {eventType.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Smart Scheduling Assistant */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Sparkles size={16} color="var(--accent)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            AI Scheduling Assistant
          </span>
        </div>
        <form onSubmit={handleAiSuggest} style={{ display: "flex", gap: 10 }}>
          <input
            className="input-field"
            placeholder='e.g. "Find me a slot next Wednesday afternoon"'
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={aiLoading}
          >
            {aiLoading ? "..." : <Send size={15} />}
          </button>
        </form>

        {aiResult && (
          <div style={{ marginTop: 14 }}>
            {aiResult.error ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {aiResult.error}
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  {aiResult.interpretation}
                </div>
                {aiResult.suggestions.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    No slots found matching your request.
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {aiResult.suggestions.map((slot, i) => (
                      <button
                        key={i}
                        className="btn btn-secondary btn-sm"
                        onClick={() => selectAiSlot(slot)}
                      >
                        {slot.displayDate} at {slot.displayTime}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedSlot ? "1fr 1fr" : "1fr 280px",
          gap: 20,
          alignItems: "start",
        }}
        className="booking-grid"
      >
        {/* Calendar */}
        {!selectedSlot && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day Headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    padding: "4px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                justifyItems: "center",
                gap: "4px 0",
              }}
            >
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* Time Slots */}
        {selectedDate && !selectedSlot && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              {format(selectedDate, "EEE, MMM d")}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              Times shown in {timezone}
            </p>

            {slotsLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "var(--text-muted)",
                }}
              >
                Loading...
              </div>
            ) : slots.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                No available slots on this day.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary"
                    onClick={() => setSelectedSlot(slot)}
                    style={{ justifyContent: "center" }}
                  >
                    {slot.displayTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Form */}
        {selectedSlot && (
          <>
            <div className="glass-card animate-fadeIn" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                Selected Time
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {format(new Date(selectedSlot.startTime), "EEE, MMM d, yyyy")}{" "}
                at {selectedSlot.displayTime}
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedSlot(null)}
                style={{ marginTop: 12 }}
              >
                Change time
              </button>
            </div>

            <div className="glass-card animate-fadeIn" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
                Your Details
              </h3>
              <form
                onSubmit={handleBooking}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label className="input-label">Name</label>
                  <input
                    className="input-field"
                    placeholder="Your full name"
                    value={bookingForm.guestName}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        guestName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="you@example.com"
                    value={bookingForm.guestEmail}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        guestEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Notes (optional)</label>
                  <textarea
                    className="input-field"
                    placeholder="Any additional information..."
                    value={bookingForm.guestNotes}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        guestNotes: e.target.value,
                      })
                    }
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={booking}
                >
                  {booking ? "Scheduling..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .booking-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
