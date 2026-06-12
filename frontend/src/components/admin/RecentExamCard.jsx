function RecentExamCard({ exam }) {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-gov">
      <h2 className="text-xl font-semibold text-gray-900">{exam.title}</h2>
      <p className="text-gray-600 mt-2">{exam.description}</p>
      <p className="mt-3 text-gray-500">Duration: {exam.duration} mins</p>
    </div>
  );
}

export default RecentExamCard;