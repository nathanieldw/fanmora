import React from 'react';

interface CommentFormProps {
    comment: string;
    isSubmitting: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function CommentForm({ 
    comment, 
    isSubmitting, 
    onChange, 
    onSubmit 
}: CommentFormProps) {
    return (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2">
            <form onSubmit={onSubmit} className="flex items-center">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-500"
                    value={comment}
                    onChange={onChange}
                />
                <button
                    type="submit"
                    disabled={!comment.trim() || isSubmitting}
                    className={`text-blue-500 text-xs font-medium ${!comment.trim() || isSubmitting ? 'opacity-50' : ''}`}
                >
                    Post
                </button>
            </form>
        </div>
    );
}
