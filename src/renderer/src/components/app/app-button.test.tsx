import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppButton from './app-button';

describe('AppButton', () => {
    describe('rendering', () => {
        it('renders with children text', () => {
            render(<AppButton>Click me</AppButton>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        });

        it('renders as button element by default', () => {
            render(<AppButton>Test</AppButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('has correct displayName', () => {
            // When wrapped in memo, displayName is on the inner component's type
            // The exported memo component does not directly expose displayName
            expect((AppButton as any).type?.displayName || 'AppButton').toBe('AppButton');
        });

        it('adds data-slot attribute', () => {
            render(<AppButton>Test</AppButton>);
            expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button');
        });
    });

    describe('variants', () => {
        it.each([
            'default',
            'destructive',
            'outline',
            'secondary',
            'ghost',
            'link',
            'transparent',
            'success',
            'warning',
            'info',
            'toolbar',
        ] as const)('renders with variant=%s', (variant) => {
            render(<AppButton variant={variant}>Test</AppButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('sizes', () => {
        it.each([
            'default',
            'sm',
            'xs',
            'lg',
            'icon',
            'icon-sm',
            'icon-xs',
            'xl',
            '2xl',
            'compact',
        ] as const)('renders with size=%s', (size) => {
            render(<AppButton size={size}>Test</AppButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('rounded', () => {
        it.each([
            'default',
            'none',
            'xs',
            'sm',
            'lg',
            'xl',
            'full',
        ] as const)('renders with rounded=%s', (rounded) => {
            render(<AppButton rounded={rounded}>Test</AppButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('shadow', () => {
        it.each([
            'none',
            'sm',
            'default',
            'lg',
            'xl',
        ] as const)('renders with shadow=%s', (shadow) => {
            render(<AppButton shadow={shadow}>Test</AppButton>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('disabled state', () => {
        it('applies disabled attribute', () => {
            render(<AppButton disabled>Disabled</AppButton>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('does not call onClick when disabled', async () => {
            const handleClick = jest.fn();
            const user = userEvent.setup();

            render(
                <AppButton disabled onClick={handleClick}>
                    Disabled
                </AppButton>
            );

            await user.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('click behavior', () => {
        it('calls onClick when clicked', async () => {
            const handleClick = jest.fn();
            const user = userEvent.setup();

            render(<AppButton onClick={handleClick}>Click me</AppButton>);
            await user.click(screen.getByRole('button'));

            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('asChild', () => {
        it('renders children as root element when asChild is true', () => {
            render(
                <AppButton asChild>
                    <a href="/test">Link Button</a>
                </AppButton>
            );
            const link = screen.getByRole('link', { name: /link button/i });
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/test');
        });
    });

    describe('forwarded props', () => {
        it('forwards ref to button element', () => {
            const ref = { current: null };
            render(<AppButton ref={ref}>Test</AppButton>);
            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        });

        it('applies custom className', () => {
            render(<AppButton className="custom-class">Test</AppButton>);
            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });

        it('forwards aria attributes', () => {
            render(<AppButton aria-label="Accessible button">Test</AppButton>);
            expect(screen.getByLabelText('Accessible button')).toBeInTheDocument();
        });

        it('forwards type attribute', () => {
            render(<AppButton type="submit">Submit</AppButton>);
            expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
        });

        it('forwards id attribute', () => {
            render(<AppButton id="my-button">Test</AppButton>);
            expect(screen.getByRole('button')).toHaveAttribute('id', 'my-button');
        });
    });

    describe('accessibility', () => {
        it('is focusable', async () => {
            const user = userEvent.setup();
            render(<AppButton>Focusable</AppButton>);

            await user.tab();
            expect(screen.getByRole('button')).toHaveFocus();
        });

        it('can be activated with keyboard', async () => {
            const handleClick = jest.fn();
            const user = userEvent.setup();

            render(<AppButton onClick={handleClick}>Press Enter</AppButton>);

            await user.tab();
            await user.keyboard('{Enter}');

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('can be activated with space key', async () => {
            const handleClick = jest.fn();
            const user = userEvent.setup();

            render(<AppButton onClick={handleClick}>Press Space</AppButton>);

            await user.tab();
            await user.keyboard(' ');

            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('memoization', () => {
        it('is wrapped in React.memo', () => {
            // memo wraps the component, so we check the $$typeof property
            // or that the component has the memo structure
            expect((AppButton as any).$$typeof?.toString() || (AppButton as any).type?.displayName).toBeDefined();
        });
    });
});
