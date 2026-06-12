function QuestionCard({ question, index, answers, handleSelect }) {
  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <h2 className="text-lg font-medium text-gray-900 pt-1.5">
          {question.questionText}
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        {question.options.map((option, optIndex) => {
          const isSelected = answers.find(
            (a) =>
              a.questionId === question._id &&
              a.selectedAnswer === option
          );

          return (
            <button
              key={option}
              onClick={() => handleSelect(question._id, option)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-900 text-white"
                    : "bg-white border border-gray-300 text-gray-500"
                }`}
              >
                {optionLetters[optIndex] || optIndex + 1}
              </span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-blue-900" : "text-gray-700"
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionCard;