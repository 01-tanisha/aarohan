import React from "react";

function TeacherCalendar() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  return (
    <div className="calendar-card">
      <h3>
        {today.toLocaleString("default", { month: "long" })} {year}
      </h3>

      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="calendar-day header">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}

        {Array.from({ length: totalDays }).map((_, i) => {
          const date = i + 1;
          const isToday = date === today.getDate();

          return (
            <div
              key={date}
              className={`calendar-day ${isToday ? "today" : ""}`}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherCalendar;