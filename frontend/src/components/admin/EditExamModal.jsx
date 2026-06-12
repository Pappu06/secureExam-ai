import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

function EditExamModal({ exam, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: exam.title,
    description: exam.description,
    duration: exam.duration,
    accessType: exam.accessType || "public",
    allowReattempt: exam.allowReattempt || false,
    maxAttempts: exam.maxAttempts || 1,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      maxAttempts: formData.allowReattempt ? Number(formData.maxAttempts) : 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Exam</h2>

        <Input
          type="text"
          name="title"
          label="Exam Title"
          value={formData.title}
          onChange={handleChange}
        />

        <Input
          type="textarea"
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <Input
          type="number"
          name="duration"
          label="Duration (minutes)"
          value={formData.duration}
          onChange={handleChange}
        />

        <div className="mb-5 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-800">Exam Access</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Public exams do not require or generate an exam code.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  formData.accessType === option.value
                    ? "border-blue-900 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="accessType"
                  value={option.value}
                  checked={formData.accessType === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Re-attempt Configuration */}
        <div className="mb-5 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Allow Re-attempts</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Let students retake this exam
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allowReattempt"
                checked={formData.allowReattempt}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900" />
            </label>
          </div>

          {formData.allowReattempt && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Maximum Attempts
              </label>
              <div className="flex gap-3">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, maxAttempts: num })}
                    className={`w-12 h-12 rounded-xl border-2 text-base font-bold transition-all duration-200 flex items-center justify-center ${
                      Number(formData.maxAttempts) === num
                        ? "border-blue-900 bg-blue-900 text-white shadow-md"
                        : "border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {Number(formData.maxAttempts) === 1
                  ? "Students get 1 attempt"
                  : `Students can attempt up to ${formData.maxAttempts} times`}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <Button variant="success" size="md" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditExamModal;
