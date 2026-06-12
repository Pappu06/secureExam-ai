import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-gov">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() => navigate("/create-exam")}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          Create Exam
        </Button>

        <Button
          variant="success"
          onClick={() => navigate("/add-question")}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          }
        >
          Add Question
        </Button>
      </div>
    </div>
  );
}

export default QuickActions;