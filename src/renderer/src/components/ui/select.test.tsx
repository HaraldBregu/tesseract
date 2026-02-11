import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
} from './select';

describe('Select', () => {
    const renderSelect = (props = {}) => {
        return render(
            <Select {...props}>
                <SelectTrigger aria-label="Select an option">
                    <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
            </Select>
        );
    };

    describe('rendering', () => {
        it('renders the trigger button', () => {
            renderSelect();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('displays placeholder text', () => {
            renderSelect();
            expect(screen.getByText('Select...')).toBeInTheDocument();
        });

        it('has correct display names', () => {
            expect(SelectTrigger.displayName).toBeDefined();
            expect(SelectContent.displayName).toBeDefined();
            expect(SelectItem.displayName).toBeDefined();
            expect(SelectLabel.displayName).toBeDefined();
            expect(SelectSeparator.displayName).toBeDefined();
        });
    });

    describe('interaction', () => {
        it('opens dropdown on keyboard Enter', async () => {
            const user = userEvent.setup();
            renderSelect();

            // Use keyboard to open since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');

            expect(screen.getByRole('listbox')).toBeInTheDocument();
            expect(screen.getByText('Option 1')).toBeInTheDocument();
            expect(screen.getByText('Option 2')).toBeInTheDocument();
            expect(screen.getByText('Option 3')).toBeInTheDocument();
        });

        it('selects an option with keyboard', async () => {
            const user = userEvent.setup();
            renderSelect();

            // Use keyboard navigation since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');
            await user.keyboard('{ArrowDown}');
            await user.keyboard('{Enter}');

            expect(screen.getByRole('combobox')).toHaveTextContent('Option 2');
        });

        it('closes dropdown after selection', async () => {
            const user = userEvent.setup();
            renderSelect();

            // Use keyboard navigation since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');
            await user.keyboard('{Enter}');

            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('calls onValueChange when selection changes', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <Select onValueChange={handleChange}>
                    <SelectTrigger aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="test-value">Test Option</SelectItem>
                    </SelectContent>
                </Select>
            );

            // Use keyboard navigation since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');
            await user.keyboard('{Enter}');

            expect(handleChange).toHaveBeenCalledWith('test-value');
        });
    });

    describe('controlled state', () => {
        it('displays controlled value', () => {
            render(
                <Select value="controlled">
                    <SelectTrigger aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="controlled">Controlled Option</SelectItem>
                    </SelectContent>
                </Select>
            );

            expect(screen.getByRole('combobox')).toHaveTextContent('Controlled Option');
        });

        it('displays default value', () => {
            render(
                <Select defaultValue="default">
                    <SelectTrigger aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default Option</SelectItem>
                    </SelectContent>
                </Select>
            );

            expect(screen.getByRole('combobox')).toHaveTextContent('Default Option');
        });
    });

    describe('disabled state', () => {
        it('applies disabled to trigger', () => {
            render(
                <Select disabled>
                    <SelectTrigger aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Option</SelectItem>
                    </SelectContent>
                </Select>
            );

            expect(screen.getByRole('combobox')).toBeDisabled();
        });

        it('applies disabled to individual items', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <Select onValueChange={handleChange}>
                    <SelectTrigger aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="disabled" disabled>
                            Disabled
                        </SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                    </SelectContent>
                </Select>
            );

            // Use keyboard navigation since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');
            // Try to select the first (disabled) item
            await user.keyboard('{Enter}');

            // Disabled item should not trigger change (only 'enabled' should trigger if selected)
            expect(handleChange).not.toHaveBeenCalledWith('disabled');
        });
    });

    describe('groups and labels', () => {
        it('renders select groups', async () => {
            const user = userEvent.setup();

            render(
                <Select>
                    <SelectTrigger aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Group 1</SelectLabel>
                            <SelectItem value="1">Item 1</SelectItem>
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                            <SelectLabel>Group 2</SelectLabel>
                            <SelectItem value="2">Item 2</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            );

            // Use keyboard navigation since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');

            expect(screen.getByText('Group 1')).toBeInTheDocument();
            expect(screen.getByText('Group 2')).toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('applies custom className to trigger', () => {
            render(
                <Select>
                    <SelectTrigger className="custom-trigger" aria-label="Select">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Option</SelectItem>
                    </SelectContent>
                </Select>
            );

            expect(screen.getByRole('combobox')).toHaveClass('custom-trigger');
        });
    });

    describe('accessibility', () => {
        it('is focusable', async () => {
            const user = userEvent.setup();
            renderSelect();

            await user.tab();
            expect(screen.getByRole('combobox')).toHaveFocus();
        });

        it('opens with keyboard', async () => {
            const user = userEvent.setup();
            renderSelect();

            await user.tab();
            await user.keyboard('{Enter}');

            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        it('navigates options with arrow keys', async () => {
            const user = userEvent.setup();
            renderSelect();

            await user.tab();
            await user.keyboard('{Enter}');
            await user.keyboard('{ArrowDown}');
            await user.keyboard('{Enter}');

            expect(screen.getByRole('combobox')).toHaveTextContent('Option 2');
        });

        it('closes with Escape', async () => {
            const user = userEvent.setup();
            renderSelect();

            // Use keyboard navigation since Radix Select has issues with pointer events in JSDOM
            await user.tab();
            await user.keyboard('{Enter}');
            expect(screen.getByRole('listbox')).toBeInTheDocument();

            await user.keyboard('{Escape}');
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });
});
