import React from 'react';
import { landingText } from '@/app/data/static';

interface Category {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}

interface Props {
  categories: Category[];
  currentCategory: number;
}

export const CategoryShowcase: React.FC<Props> = ({
  categories,
  currentCategory,
}) => (
  <div className='text-center space-y-8'>
    <div className='relative mx-auto w-64 h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex flex-col items-center justify-center shadow-2xl'>
      <div className='mb-3'>
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Icon
              key={index}
              className={`w-16 h-16 text-white transition-all duration-500 ${
                index === currentCategory
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-75 absolute'
              }`}
            />
          );
        })}
      </div>

      <div className='text-center text-white'>
        <div className='text-lg font-semibold'>Jual Beli</div>
        <div className='text-2xl font-bold'>
          {categories[currentCategory].label}
        </div>
        <div className='text-sm opacity-90'>Aman & Mudah</div>
      </div>

      <div className='absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center'>
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Icon
              key={index}
              className={`w-6 h-6 transition-all duration-500 ${
                index === (currentCategory + 1) % categories.length
                  ? `${category.color} opacity-100 scale-100`
                  : 'text-gray-400 opacity-0 scale-75 absolute'
              }`}
            />
          );
        })}
      </div>
      <div className='absolute -bottom-2 -left-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center'>
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Icon
              key={index}
              className={`w-6 h-6 transition-all duration-500 ${
                index === (currentCategory + 2) % categories.length
                  ? `${category.color} opacity-100 scale-100`
                  : 'text-gray-400 opacity-0 scale-75 absolute'
              }`}
            />
          );
        })}
      </div>
    </div>

    <div className='space-y-4 text-left max-w-sm mx-auto'>
      {landingText.processSteps.map((step, idx) => (
        <div className='flex items-center space-x-3' key={idx}>
          <div
            className={`w-6 h-6 ${landingText.processStepIconColor} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <svg
              className='w-4 h-4 text-white'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <span
            className={`text-gray-700 text-sm ${
              landingText.processStepBold[idx] ? 'font-semibold' : ''
            }`}
          >
            {landingText.processStepHighlight[idx]
              ? step.replace(
                  '{category}',
                  categories[currentCategory].label.toLowerCase()
                )
              : step}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default CategoryShowcase;
