import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

describe('Tabs', () => {
    const renderTabs = (props = {}) => {
        return render(
            <Tabs defaultValue="tab1" {...props}>
                <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">Content 1</TabsContent>
                <TabsContent value="tab2">Content 2</TabsContent>
                <TabsContent value="tab3">Content 3</TabsContent>
            </Tabs>
        );
    };

    describe('rendering', () => {
        it('renders all tab triggers', () => {
            renderTabs();
            expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
        });

        it('renders tab list', () => {
            renderTabs();
            expect(screen.getByRole('tablist')).toBeInTheDocument();
        });

        it('renders default tab content', () => {
            renderTabs();
            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 1');
        });

        it('has correct display names', () => {
            expect(TabsList.displayName).toBeDefined();
            expect(TabsTrigger.displayName).toBeDefined();
            expect(TabsContent.displayName).toBeDefined();
        });
    });

    describe('tab switching', () => {
        it('switches content on tab click', async () => {
            const user = userEvent.setup();
            renderTabs();

            await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 2');

            await user.click(screen.getByRole('tab', { name: 'Tab 3' }));
            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 3');

            await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 1');
        });

        it('calls onValueChange when tab changes', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <Tabs defaultValue="tab1" onValueChange={handleChange}>
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content 1</TabsContent>
                    <TabsContent value="tab2">Content 2</TabsContent>
                </Tabs>
            );

            await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
            expect(handleChange).toHaveBeenCalledWith('tab2');
        });
    });

    describe('controlled state', () => {
        it('displays controlled tab', () => {
            render(
                <Tabs value="tab2">
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content 1</TabsContent>
                    <TabsContent value="tab2">Content 2</TabsContent>
                </Tabs>
            );

            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 2');
        });
    });

    describe('active state', () => {
        it('marks active tab', () => {
            renderTabs();
            const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
            expect(activeTab).toHaveAttribute('data-state', 'active');
        });

        it('updates active state on switch', async () => {
            const user = userEvent.setup();
            renderTabs();

            const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
            const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

            expect(tab1).toHaveAttribute('data-state', 'active');
            expect(tab2).toHaveAttribute('data-state', 'inactive');

            await user.click(tab2);

            expect(tab1).toHaveAttribute('data-state', 'inactive');
            expect(tab2).toHaveAttribute('data-state', 'active');
        });
    });

    describe('disabled tabs', () => {
        it('prevents clicking disabled tab', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();

            render(
                <Tabs defaultValue="tab1" onValueChange={handleChange}>
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2" disabled>
                            Tab 2
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content 1</TabsContent>
                    <TabsContent value="tab2">Content 2</TabsContent>
                </Tabs>
            );

            await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
            expect(handleChange).not.toHaveBeenCalled();
            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 1');
        });

        it('applies disabled styling', () => {
            render(
                <Tabs defaultValue="tab1">
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2" disabled>
                            Tab 2
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content 1</TabsContent>
                    <TabsContent value="tab2">Content 2</TabsContent>
                </Tabs>
            );

            expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeDisabled();
        });
    });

    describe('styling', () => {
        it('applies custom className to list', () => {
            render(
                <Tabs defaultValue="tab1">
                    <TabsList className="custom-list">
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content</TabsContent>
                </Tabs>
            );

            expect(screen.getByRole('tablist')).toHaveClass('custom-list');
        });

        it('applies custom className to trigger', () => {
            render(
                <Tabs defaultValue="tab1">
                    <TabsList>
                        <TabsTrigger value="tab1" className="custom-trigger">
                            Tab 1
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">Content</TabsContent>
                </Tabs>
            );

            expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveClass('custom-trigger');
        });

        it('applies custom className to content', () => {
            render(
                <Tabs defaultValue="tab1">
                    <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="custom-content">
                        Content
                    </TabsContent>
                </Tabs>
            );

            expect(screen.getByRole('tabpanel')).toHaveClass('custom-content');
        });
    });

    describe('accessibility', () => {
        it('uses correct ARIA roles', () => {
            renderTabs();
            expect(screen.getByRole('tablist')).toBeInTheDocument();
            expect(screen.getAllByRole('tab')).toHaveLength(3);
            expect(screen.getByRole('tabpanel')).toBeInTheDocument();
        });

        it('navigates with arrow keys', async () => {
            const user = userEvent.setup();
            renderTabs();

            await user.tab();
            expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();

            await user.keyboard('{ArrowRight}');
            expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();

            await user.keyboard('{ArrowRight}');
            expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus();

            await user.keyboard('{ArrowLeft}');
            expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
        });

        it('activates focused tab with Enter/Space', async () => {
            const user = userEvent.setup();
            renderTabs();

            await user.tab();
            await user.keyboard('{ArrowRight}');
            await user.keyboard('{Enter}');

            expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 2');
        });
    });
});
