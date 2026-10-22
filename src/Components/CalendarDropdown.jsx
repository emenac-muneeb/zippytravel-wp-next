"use client";
import React, { useState } from "react";

const CalendarDropdown = ({
  selectedDate,
  onSelectDate,
  minDate,
  className = "",
}) => {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split("-");
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthTitle = `${monthNames[month]} ${year}`;

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // Trailing previous month days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevDays.push(daysInPrevMonth - i);
  }

  // Current month days
  const currentDays = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentDays.push(d);
  }

  // Trailing next month days (make 35 or 42 cells)
  const totalCells = prevDays.length + currentDays.length;
  const targetCells = totalCells > 35 ? 42 : 35;
  const nextDays = [];
  for (let i = 1; i <= targetCells - totalCells; i++) {
    nextDays.push(i);
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-[395px] h-[304px] bg-white rounded-[16px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-gray-100 px-[22px] py-[16px] flex flex-col justify-between font-poppins select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between relative px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="w-[20px] h-[20px] rounded-full border border-[#180048] flex items-center justify-center text-[#180048] hover:bg-[#180048] hover:text-white transition-colors cursor-pointer"
          aria-label="Previous Month"
        >
          <svg className="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="16 6 8 12 16 18" />
          </svg>
        </button>

        <span className="font-poppins font-semibold text-[18px] text-[#3E9DBA] tracking-wide">
          {monthTitle}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="w-[20px] h-[20px] rounded-full border border-[#180048] flex items-center justify-center text-[#180048] hover:bg-[#180048] hover:text-white transition-colors cursor-pointer"
          aria-label="Next Month"
        >
          <svg className="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="8 6 16 12 8 18" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center font-poppins font-bold text-[14.5px] text-[#180048]">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-0.5">
            {day}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 text-center gap-y-[2px]">
        {/* Prev month days */}
        {prevDays.map((d) => (
          <div
            key={`prev-${d}`}
            className="h-[32px] flex items-center justify-center text-[#9AA5B1] font-normal text-[15px]"
          >
            {d}
          </div>
        ))}

        {/* Current month days */}
        {currentDays.map((d) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isPast = minDate && dateStr < minDate;

          return (
            <div key={`curr-${d}`} className="h-[32px] flex items-center justify-center">
              <button
                type="button"
                disabled={isPast}
                onClick={() => onSelectDate(dateStr)}
                className={`w-[32px] h-[32px] flex items-center justify-center text-[15px] transition-all ${
                  isSelected
                    ? "bg-[#180048] text-white font-medium rounded-[6px]"
                    : isPast
                    ? "text-[#C4CDD5] cursor-not-allowed"
                    : "text-[#180048] font-normal hover:bg-gray-100 rounded-[6px] cursor-pointer"
                }`}
              >
                {d}
              </button>
            </div>
          );
        })}

        {/* Next month days */}
        {nextDays.map((d) => (
          <div
            key={`next-${d}`}
            className="h-[32px] flex items-center justify-center text-[#9AA5B1] font-normal text-[15px]"
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarDropdown;
