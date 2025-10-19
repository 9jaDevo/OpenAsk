import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { useSDK } from '../providers/SDKProvider';
import { questionSchema, type QuestionFormData } from '../schemas/validation';
import { Button, Input, Textarea, Card } from '@openask/ui';

export const AskQuestion: React.FC = () => {
  const sdk = useSDK();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      body: '',
      tags: [],
    },
  });

  const tags = watch('tags');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setValue('tags', [...tags, tag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((t) => t !== tagToRemove)
    );
  };

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);

    try {
      const question = await sdk.createQuestion(data);
      toast.success('Question created successfully! AI is generating a draft answer...');
      navigate(`/q/${question._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card padding="lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ask a Question</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Title"
                {...register('title')}
                error={errors.title?.message}
                placeholder="What's your question? Be specific."
                helperText="10-160 characters"
              />
            </div>

            <div>
              <Textarea
                label="Question Body"
                {...register('body')}
                error={errors.body?.message}
                rows={10}
                placeholder="Provide all the details. You can use Markdown formatting."
                helperText="Minimum 20 characters. Markdown supported."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter or comma to add)"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={(tags?.length ?? 0) >= 5}
              />
              {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Add up to 5 tags to help others find your question
              </p>

              {(tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your question will be posted to the community</li>
                <li>• AI will generate a draft answer to get you started</li>
                <li>• Community members can improve and vote on answers</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
                Post Question
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
