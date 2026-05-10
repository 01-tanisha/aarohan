import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function StudentCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div>
      <h3>Academic Calendar</h3>
      <Calendar value={date} onChange={setDate} />
    </div>
  );
}

export default StudentCalendar;
