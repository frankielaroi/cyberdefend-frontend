import { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Save, X } from 'lucide-react';
import type { Question } from '../../types';
import { mockQuestions, questionCategories } from '../../data/mockQuestions';

export default function QuestionManager() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [isLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Filter questions by category
  const filteredQuestions = selectedCategory 
    ? questions.filter(q => q.category === selectedCategory)
    : questions;

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleCreate = (newQuestion: Omit<Question, 'id'>) => {
    const question: Question = {
      ...newQuestion,
      id: 'q-' + Date.now()
    };
    setQuestions(prev => [...prev, question]);
    setShowCreate(false);
  };

  const handleUpdate = (id: string, updatedQuestion: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updatedQuestion } : q
    ));
    setEditingId(null);
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
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {questionCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Questions ({filteredQuestions.length})</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600">Loading...</div>
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
          categories={questionCategories}
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
  question: Question;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: Partial<Question>) => void;
  onDelete: () => void;
}) {
  const [editData, setEditData] = useState(question);

  if (isEditing) {
    return (
      <div className="p-6 bg-blue-50">
        <input
          value={editData.text}
          onChange={(e) => setEditData({ ...editData, text: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3"
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            value={editData.weight}
            onChange={(e) => setEditData({ ...editData, weight: Number(e.target.value) })}
            className="px-4 py-2 border border-slate-300 rounded-lg"
            placeholder="Weight"
            min="1"
            max="10"
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

  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {question.category}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
              {question.type.replace('_', ' ')}
            </span>
            <span className="text-sm text-slate-600">Weight: {question.weight}</span>
          </div>
          <p className="text-slate-900 font-medium">{question.text}</p>
          {question.options && question.options.length > 0 && (
            <div className="mt-2 text-sm text-slate-600">
              Options: {question.options.join(', ')}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  onCreate: (data: Omit<Question, 'id'>) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    category: categories[0],
    text: '',
    type: 'multiple_choice' as const,
    options: [''],
    weight: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add Question</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="yes_no">Yes/No</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Weight (1-10)</label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
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
