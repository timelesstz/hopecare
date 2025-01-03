import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SkillsLanguagesSection from '../SkillsLanguagesSection';

describe('SkillsLanguagesSection', () => {
  const mockRegister = vi.fn();
  const mockErrors = {};

  beforeEach(() => {
    mockRegister.mockReturnValue({});
  });

  it('renders skills and languages checkboxes', () => {
    render(
      <SkillsLanguagesSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    expect(screen.getByText('Teaching')).toBeInTheDocument();
    expect(screen.getByText('First Aid')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    const errors = {
      skills: { message: 'Select at least one skill' },
      languages: { message: 'Select at least one language' }
    };

    render(
      <SkillsLanguagesSection
        register={mockRegister}
        errors={errors}
      />
    );

    expect(screen.getByText('Select at least one skill')).toBeInTheDocument();
    expect(screen.getByText('Select at least one language')).toBeInTheDocument();
  });

  it('calls register for skills and languages', () => {
    render(
      <SkillsLanguagesSection
        register={mockRegister}
        errors={mockErrors}
      />
    );

    expect(mockRegister).toHaveBeenCalledWith('skills');
    expect(mockRegister).toHaveBeenCalledWith('languages');
  });
});