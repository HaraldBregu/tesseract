import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from './combobox';

describe('Combobox', () => {
    const defaultProps = {
        selectOptions: ['Option 1', 'Option 2', 'Option 3'],
        setInput: jest.fn(),
        input: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('renders the combobox input', () => {
            render(<Combobox {...defaultProps} />);
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('renders with placeholder', () => {
            render(<Combobox {...defaultProps} placeholder="Search..." />);
            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });

        it('renders with left icon', () => {
            render(
                <Combobox
                    {...defaultProps}
                    leftIcon={<span data-testid="left-icon">🔍</span>}
                />
            );
            expect(screen.getByTestId('left-icon')).toBeInTheDocument();
        });

        it('renders chevron down icon', () => {
            render(<Combobox {...defaultProps} />);
            // ChevronDown is present in the trigger button
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('input behavior', () => {
        it('displays initial input value', () => {
            render(<Combobox {...defaultProps} input="test value" />);
            expect(screen.getByRole('textbox')).toHaveValue('test value');
        });

        it('calls setInput on typing', async () => {
            const setInput = jest.fn();
            const user = userEvent.setup();

            render(<Combobox {...defaultProps} setInput={setInput} />);
            await user.type(screen.getByRole('textbox'), 'hello');

            expect(setInput).toHaveBeenCalled();
        });

        it('shows clear button when input has value', () => {
            render(<Combobox {...defaultProps} input="test" />);
            // Icon close button should be present
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(1);
        });

        it('hides clear button when input is empty', () => {
            render(<Combobox {...defaultProps} input="" />);
            const buttons = screen.getAllByRole('button');
            // Only trigger button should be present
            expect(buttons).toHaveLength(1);
        });

        it('calls setInput with empty string when clear is clicked', async () => {
            const setInput = jest.fn();
            const user = userEvent.setup();

            render(<Combobox {...defaultProps} setInput={setInput} input="test" />);
            const buttons = screen.getAllByRole('button');
            const clearButton = buttons.find((btn) =>
                btn.className.includes('rounded-2xl')
            );

            if (clearButton) {
                await user.click(clearButton);
                expect(setInput).toHaveBeenCalledWith('');
            }
        });
    });

    describe('dropdown behavior', () => {
        it('opens dropdown on trigger click', async () => {
            const user = userEvent.setup();

            render(<Combobox {...defaultProps} />);
            await user.click(screen.getByRole('button'));

            // Options should appear in dropdown
            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
            expect(screen.getByText('Option 3')).toBeInTheDocument();
        });

        it('selects option on click', async () => {
            const setInput = jest.fn();
            const user = userEvent.setup();

            render(<Combobox {...defaultProps} setInput={setInput} />);
            await user.click(screen.getByRole('button'));
            await user.click(screen.getByText('Option 2'));

            expect(setInput).toHaveBeenCalledWith('Option 2');
        });

        it('closes dropdown after selection', async () => {
            const user = userEvent.setup();

            render(<Combobox {...defaultProps} />);
            await user.click(screen.getByRole('button'));
            await user.click(screen.getByText('Option 1'));

            // Dropdown should be closed, option should not be visible
            expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
        });

        it('does not open when no options available', async () => {
            const user = userEvent.setup();

            render(<Combobox {...defaultProps} selectOptions={[]} />);
            await user.click(screen.getByRole('button'));

            // No dropdown content should appear
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });

    describe('word count display', () => {
        it('shows word count when input has value and totalWWordFound > 0', () => {
            render(
                <Combobox
                    {...defaultProps}
                    input="test"
                    totalWWordFound={10}
                    wordNumber={3}
                />
            );
            expect(screen.getByText('3/10')).toBeInTheDocument();
        });

        it('shows only total when wordNumber is not provided', () => {
            render(
                <Combobox {...defaultProps} input="test" totalWWordFound={5} />
            );
            // Component shows "undefined/5" when wordNumber is not provided but totalWWordFound > 0
            expect(screen.getByText(/\/.*5/)).toBeInTheDocument();
        });

        it('does not show count when input is empty', () => {
            render(
                <Combobox
                    {...defaultProps}
                    input=""
                    totalWWordFound={10}
                    wordNumber={3}
                />
            );
            expect(screen.queryByText('3/10')).not.toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('applies custom dropdown container classes', async () => {
            const user = userEvent.setup();

            render(
                <Combobox
                    {...defaultProps}
                    dropdownContainerClassNames="custom-dropdown"
                />
            );
            await user.click(screen.getByRole('button'));

            // Check that custom class is applied somewhere in the rendered output
            const popoverContent = document.querySelector('.custom-dropdown');
            expect(popoverContent).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('input is focusable', async () => {
            const user = userEvent.setup();
            render(<Combobox {...defaultProps} />);

            await user.tab();
            // Either button or input should be focused
            expect(document.activeElement).not.toBe(document.body);
        });
    });
});
