export const CalendarInstructions = () => {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-semibold text-blue-800">Quick Tips:</p>
          <p className="text-sm text-blue-700">
            • Drag appointments to reschedule them to any time slot
            • Click on appointments to view detailed information
            • Use the × button to cancel appointments
            • Purple color indicates rescheduled appointments
          </p>
        </div>
      </div>
    </div>
  );
};
