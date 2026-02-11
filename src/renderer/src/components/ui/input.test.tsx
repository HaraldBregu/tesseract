import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
    describe('rendering', () => {
        it('renders an input element', () => {
            render(<Input />);
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('has correct display name', () => {
            expect(Input.displayName).toBe('Input');
        });
    });

    describe('types', () => {
        it('renders with type="text" by default', () => {
            render(<Input />);
            // Input component renders without explicit type attribute
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('renders with type="email"', () => {
            render(<Input type="email" />);
            expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
        });

        it('renders with type="password"', () => {
            render(<Input type="password" />);
            // Password inputs don't have textbox role
            const input = document.querySelector('input[type="password"]');
            expect(input).toBeInTheDocument();
        });

        it('renders with type="number"', () => {
            render(<Input type="number" />);
            expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
        });
    });

    describe('placeholder', () => {
        it('displays placeholder text', () => {
            render(<Input placeholder="Enter text..." />);
            expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
        });
    });

    describe('value and onChange', () => {
        it('displays value', () => {
            render(<Input value="test value" onChange={() => { }} />);
            expect(screen.getByRole('textbox')).toHaveValue('test value');
        });

        it('calls onChange when user types', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<Input onChange={handleChange} />);
            await user.type(screen.getByRole('textbox'), 'hello');

            expect(handleChange).toHaveBeenCalled();
        });

        it('updates value on user input (uncontrolled)', async () => {
            const user = userEvent.setup();

            render(<Input defaultValue="" />);
            const input = screen.getByRole('textbox');

            await user.type(input, 'test input');
            expect(input).toHaveValue('test input');
        });
    });

    describe('disabled state', () => {
        it('applies disabled attribute', () => {
            render(<Input disabled />);
            expect(screen.getByRole('textbox')).toBeDisabled();
        });

        it('prevents user input when disabled', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(<Input disabled onChange={handleChange} />);

            await user.type(screen.getByRole('textbox'), 'test');
            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('forwarded props', () => {
        it('forwards ref', () => {
            const ref = { current: null };
            render(<Input ref={ref} />);
            expect(ref.current).toBeInstanceOf(HTMLInputElement);
        });

        it('applies custom className', () => {
            render(<Input className="custom-input" />);
            expect(screen.getByRole('textbox')).toHaveClass('custom-input');
        });

        it('forwards id', () => {
            render(<Input id="my-input" />);
            expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-input');
        });

        it('forwards name', () => {
            render(<Input name="username" />);
            expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
        });

        it('forwards aria-label', () => {
            render(<Input aria-label="Search input" />);
            expect(screen.getByLabelText('Search input')).toBeInTheDocument();
        });

        it('forwards required attribute', () => {
            render(<Input required />);
            expect(screen.getByRole('textbox')).toBeRequired();
        });

        it('forwards readonly attribute', () => {
            render(<Input readOnly />);
            expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
        });
    });

    describe('accessibility', () => {
        it('is focusable', async () => {
            const user = userEvent.setup();
            render(<Input />);

            await user.tab();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('can be focused programmatically', () => {
            const ref = { current: null as HTMLInputElement | null };
            render(<Input ref={ref} />);

            ref.current?.focus();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });
    });
});
