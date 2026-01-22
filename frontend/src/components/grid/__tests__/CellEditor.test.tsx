import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CellEditor } from '../CellEditor';

describe('CellEditor', () => {
  it('renders text input for text type', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <CellEditor
        value="test value"
        type="text"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders number input for number type', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <CellEditor
        value={123}
        type="number"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const input = screen.getByDisplayValue('123');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('renders select for select type', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const options = ['Option A', 'Option B', 'Option C'];

    render(
      <CellEditor
        value="Option A"
        type="select"
        options={options}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('calls onSave when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <CellEditor
        value="test"
        type="text"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const input = screen.getByDisplayValue('test');
    await user.type(input, '{Enter}');

    expect(onSave).toHaveBeenCalledWith('test');
  });

  it('calls onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <CellEditor
        value="test"
        type="text"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const input = screen.getByDisplayValue('test');
    await user.type(input, '{Escape}');

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onSave on blur for text input', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <CellEditor
        value="test"
        type="text"
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const input = screen.getByDisplayValue('test');
    await user.click(input);
    await user.tab();

    expect(onSave).toHaveBeenCalled();
  });
});
