import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
    describe('rendering', () => {
        it('renders a checkbox', () => {
            render(<Checkbox aria-label="Test checkbox" />);
            expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });

        it('renders with label text', () => {
            render(<Checkbox label="Accept terms" />);
            expect(screen.getByText('Accept terms')).toBeInTheDocument();
        });

        it('renders with React node as label', () => {
            render(
                <Checkbox label={<span data-testid="custom-label">Custom Label</span>} />
            );
            expect(screen.getByTestId('custom-label')).toBeInTheDocument();
        });
    });

    describe('checked state', () => {
        it('is unchecked by default', () => {
            render(<Checkbox aria-label="Test" />);
            expect(screen.getByRole('checkbox')).not.toBeChecked();
        });

        it('is checked when checked prop is true', () => {
            render(<Checkbox aria-label="Test" checked />);
            expect(screen.getByRole('checkbox')).toBeChecked();
        });

        it('calls onCheckedChange when clicked', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<Checkbox aria-label="Test" onCheckedChange={handleChange} />);
            await user.click(screen.getByRole('checkbox'));

            expect(handleChange).toHaveBeenCalledWith(true);
        });

        it('toggles state on click (uncontrolled)', async () => {
            const user = userEvent.setup();

            render(<Checkbox aria-label="Test" defaultChecked={false} />);
            const checkbox = screen.getByRole('checkbox');

            expect(checkbox).not.toBeChecked();
            await user.click(checkbox);
            expect(checkbox).toBeChecked();
            await user.click(checkbox);
            expect(checkbox).not.toBeChecked();
        });
    });

    describe('disabled state', () => {
        it('applies disabled attribute', () => {
            render(<Checkbox aria-label="Test" disabled />);
            expect(screen.getByRole('checkbox')).toBeDisabled();
        });

        it('does not call onCheckedChange when disabled', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <Checkbox aria-label="Test" disabled onCheckedChange={handleChange} />
            );
            await user.click(screen.getByRole('checkbox'));

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('styling', () => {
        it('applies custom className to checkbox', () => {
            render(<Checkbox aria-label="Test" className="custom-checkbox" />);
            expect(screen.getByRole('checkbox')).toHaveClass('custom-checkbox');
        });

        it('applies custom labelClassName to label', () => {
            render(<Checkbox label="Test" labelClassName="custom-label" />);
            expect(screen.getByText('Test')).toHaveClass('custom-label');
        });
    });

    describe('forwarded props', () => {
        it('forwards ref', () => {
            const ref = { current: null };
            render(<Checkbox ref={ref} aria-label="Test" />);
            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        });

        it('forwards id', () => {
            render(<Checkbox id="my-checkbox" aria-label="Test" />);
            expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'my-checkbox');
        });

        it('forwards name', () => {
            render(<Checkbox name="terms" aria-label="Test" />);
            // Radix checkbox uses name prop internally
            expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('is focusable', async () => {
            const user = userEvent.setup();
            render(<Checkbox aria-label="Test" />);

            await user.tab();
            expect(screen.getByRole('checkbox')).toHaveFocus();
        });

        it('can be toggled with keyboard', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<Checkbox aria-label="Test" onCheckedChange={handleChange} />);

            await user.tab();
            await user.keyboard(' ');

            expect(handleChange).toHaveBeenCalledWith(true);
        });

        it('associates label with checkbox', () => {
            render(<Checkbox label="Accept" />);
            expect(screen.getByText('Accept').tagName).toBe('LABEL');
        });
    });
});
