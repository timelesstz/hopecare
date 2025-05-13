import React from 'react';
import { Block } from '../../types';

interface PreviewProps {
  blocks: Block[];
}

const Preview: React.FC<PreviewProps> = ({ blocks }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        {blocks.map((block) => (
          <div key={block.id} className="mb-6 last:mb-0">
            {block.type === 'heading' && (
              <h${block.settings?.level || 2} className="text-2xl font-bold mb-4">
                {block.content}
              </h${block.settings?.level || 2}>
            )}

            {block.type === 'text' && (
              <p className="text-gray-700 leading-relaxed">{block.content}</p>
            )}

            {block.type === 'image' && (
              <img
                src={block.content}
                alt=""
                className="w-full rounded-lg mb-4 object-cover"
              />
            )}

            {block.type === 'columns' && (
              <div className={`grid grid-cols-${block.settings?.columns || 2} gap-6`}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}

            {block.type === 'list' && (
              <ul className={`pl-6 ${block.settings?.listType === 'number' ? 'list-decimal' : 'list-disc'}`}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}

            {block.type === 'quote' && (
              <blockquote className="border-l-4 border-rose-500 pl-4 italic text-gray-600">
                {block.content}
              </blockquote>
            )}

            {block.type === 'code' && (
              <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                <code className={`language-${block.settings?.language}`}>
                  {block.content}
                </code>
              </pre>
            )}

            {block.type === 'video' && (
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: block.content }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;