import { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X } from 'lucide-react';
import type { CreateQuestionDto, UpdateQuestionDto } from '../../types';
import { 
  useGetQuestionsQuery, 
  useGetCategoriesQuery,
  useCreateQuestionMutation, 
  useUpdateQuestionMutation, 
  useDeleteQuestionMutation 
} from '../../store/api/adminApi';

export default function QuestionManager() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // API queries and mutations
  const { data: questionsData, isLoading, error } = useGetQuestionsQuery({});
  
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  // Extract data from API responses
  const allCategories = categoriesData?.categories || [];
  const categoriesWithQuestions = questionsData?.categories || [];
  
  // Flatten all questions from all categories
  const allQuestions = categoriesWithQuestions.flatMap(cat => 
    cat.questions.map(q => ({
      ...q,
      category: cat.category,
    }))
  );

  // Filter questions by selected category
  const filteredQuestions = selectedCategoryId
    ? allQuestions.filter(q => q.category.id === selectedCategoryId)
    : allQuestions;

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id).unwrap();
      } catch (error: any) {
        console.error('Failed to delete question:', error);
        // Error will be shown by RTK Query error state
      }
    }
  };

  const handleCreate = async (newQuestion: CreateQuestionDto) => {
    try {
      await createQuestion(newQuestion).unwrap();
      setShowCreate(false);
    } catch (error: any) {
      console.error('Failed to create question:', error);
      // Error will be shown by RTK Query error state
    }
  };

  const handleUpdate = async (id: string, updatedQuestion: UpdateQuestionDto) => {
    try {
      await updateQuestion({ id, data: updatedQuestion }).unwrap();
      setEditingId(null);
    } catch (error: any) {
      console.error('Failed to update question:', error);
      // Error will be shown by RTK Query error state
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-600 mt-1">Manage assessment questions and categories</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategoryId('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategoryId === '' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories ({allQuestions.length})
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name} ({cat.questionCount})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            Questions ({filteredQuestions.length} of {questionsData?.total || 0})
          </h2>
        </div>
        <div className="divide-y divide-slate-200">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600">Loading questions...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load questions. Please try again.
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No questions found. Add your first question to get started.
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                isEditing={editingId === question.id}
                onEdit={() => setEditingId(question.id)}
                onCancelEdit={() => setEditingId(null)}
                onSave={(data) => handleUpdate(question.id, data)}
                onDelete={() => handleDelete(question.id)}
              />
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <CreateQuestionModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          categories={allCategories}
        />
      )}
    </div>
  );
}

function QuestionRow({
  question,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  question: any; // Using any for now since it has category object attached
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: UpdateQuestionDto) => void;
  onDelete: () => void;
}) {
  const [editData, setEditData] = useState({
    text: question.text,
    weight: question.weight,
    description: question.description,
  });

  if (isEditing) {
    return (
      <div className="p-6 bg-blue-50">
        <input
          value={editData.text}
          onChange={(e) => setEditData({ ...editData, text: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3"
          placeholder="Question text"
        />
        <textarea
          value={editData.description || ''}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            value={editData.weight}
            onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
            className="px-4 py-2 border border-slate-300 rounded-lg"
            placeholder="Weight"
            min="0.1"
            max="10"
            step="0.1"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(editData)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const categoryName = question.category?.name || 'Unknown';
  const questionType = question.type?.replace(/_/g, ' ') || 'Unknown';

  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {categoryName}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
              {questionType}
            </span>
            <span className="text-sm text-slate-600">Weight: {question.weight}</span>
            {question.required && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Required</span>
            )}
          </div>
          <p className="text-slate-900 font-medium">{question.text}</p>
          {question.description && (
            <p className="text-sm text-slate-600 mt-1">{question.description}</p>
          )}
          {question.options && question.options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {question.options.map((option: any, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                  {option.text}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit question"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateQuestionModal({
  onClose,
  onCreate,
  categories,
}: {
  onClose: () => void;
  onCreate: (data: CreateQuestionDto) => void;
  categories: Array<{ id: string; name: string; description: string; weight: number; order: number }>;
}) {
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || '',
    text: '',
    type: 'SINGLE_CHOICE' as const,
    description: '',
    options: [],
    weight: 1,
    required: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Add Question</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Question Text</label>
            <textarea
              required
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="Enter your question here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="Additional context or help text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="YES_NO">Yes/No</option>
              <option value="SINGLE_CHOICE">Single Choice</option>
              <option value="RATING">Rating</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Weight</label>
              <input
                type="number"
                required
                min="0.1"
                max="10"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">Required Question</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
