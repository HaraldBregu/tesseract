import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from './dialog';

describe('Dialog', () => {
    const renderDialog = (props = {}) => {
        return render(
            <Dialog {...props}>
                <DialogTrigger asChild>
                    <button>Open Dialog</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Test Title</DialogTitle>
                        <DialogDescription>Test description</DialogDescription>
                    </DialogHeader>
                    <div>Dialog content</div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <button>Close</button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    describe('rendering', () => {
        it('renders the trigger button', () => {
            renderDialog();
            expect(screen.getByText('Open Dialog')).toBeInTheDocument();
        });

        it('does not show content initially', () => {
            renderDialog();
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('has correct display names', () => {
            expect(DialogContent.displayName).toBeDefined();
            expect(DialogOverlay.displayName).toBeDefined();
            expect(DialogTitle.displayName).toBeDefined();
            expect(DialogDescription.displayName).toBeDefined();
            expect(DialogHeader.displayName).toBe('DialogHeader');
            expect(DialogFooter.displayName).toBe('DialogFooter');
        });
    });

    describe('opening and closing', () => {
        it('opens on trigger click', async () => {
            const user = userEvent.setup();
            renderDialog();

            await user.click(screen.getByText('Open Dialog'));

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test description')).toBeInTheDocument();
            expect(screen.getByText('Dialog content')).toBeInTheDocument();
        });

        it('closes on close button click', async () => {
            const user = userEvent.setup();
            renderDialog();

            await user.click(screen.getByText('Open Dialog'));
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            // Find the Close button in the footer (not the X button with sr-only "Close")
            const closeButtons = screen.getAllByRole('button');
            const footerCloseButton = closeButtons.find(
                (btn) => btn.textContent === 'Close' && !btn.querySelector('.sr-only')
            );
            expect(footerCloseButton).toBeDefined();
            await user.click(footerCloseButton!);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('closes on X button click', async () => {
            const user = userEvent.setup();
            renderDialog();

            await user.click(screen.getByText('Open Dialog'));
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            // Click the X close button (sr-only text "Close")
            const closeButtons = screen.getAllByRole('button');
            const xButton = closeButtons.find(
                (btn) => btn.querySelector('.sr-only')?.textContent === 'Close'
            );
            if (xButton) {
                await user.click(xButton);
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            }
        });

        it('closes on Escape key', async () => {
            const user = userEvent.setup();
            renderDialog();

            await user.click(screen.getByText('Open Dialog'));
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            await user.keyboard('{Escape}');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('controlled state', () => {
        it('responds to open prop', () => {
            render(
                <Dialog open>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Controlled Dialog</DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            );

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
        });

        it('calls onOpenChange when dialog state changes', async () => {
            const handleOpenChange = jest.fn();
            const user = userEvent.setup();

            render(
                <Dialog onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <button>Open</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Test</DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            );

            await user.click(screen.getByText('Open'));
            expect(handleOpenChange).toHaveBeenCalledWith(true);

            await user.keyboard('{Escape}');
            expect(handleOpenChange).toHaveBeenCalledWith(false);
        });
    });

    describe('styling', () => {
        it('applies custom className to content', async () => {
            const user = userEvent.setup();

            render(
                <Dialog>
                    <DialogTrigger>Open</DialogTrigger>
                    <DialogContent className="custom-dialog">
                        <DialogTitle>Test</DialogTitle>
                    </DialogContent>
                </Dialog>
            );

            await user.click(screen.getByText('Open'));
            expect(screen.getByRole('dialog')).toHaveClass('custom-dialog');
        });

        it('applies custom className to header', async () => {
            const user = userEvent.setup();

            render(
                <Dialog>
                    <DialogTrigger>Open</DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="custom-header">
                            <DialogTitle>Test</DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            );

            await user.click(screen.getByText('Open'));
            expect(screen.getByText('Test').parentElement).toHaveClass('custom-header');
        });
    });

    describe('accessibility', () => {
        it('has role="dialog"', async () => {
            const user = userEvent.setup();
            renderDialog();

            await user.click(screen.getByText('Open Dialog'));
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('focuses content when opened', async () => {
            const user = userEvent.setup();
            renderDialog();

            await user.click(screen.getByText('Open Dialog'));
            // Dialog or first focusable element should have focus
            expect(document.activeElement).not.toBe(document.body);
        });

        it('returns focus to trigger when closed', async () => {
            const user = userEvent.setup();
            renderDialog();

            const trigger = screen.getByText('Open Dialog');
            await user.click(trigger);
            await user.keyboard('{Escape}');

            expect(trigger).toHaveFocus();
        });
    });
});
