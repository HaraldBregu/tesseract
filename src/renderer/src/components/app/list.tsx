type ListProps<T> = {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactElement;
}

export default function List<T>({ data, renderItem }: ListProps<T>) {
    return data.map((item, index) => { return renderItem(item, index) });
}