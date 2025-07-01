type ListProps<T> = {
    data: T[];
    renderItem: (item: T, index: number) => JSX.Element;
}

export default function List<T>({ data, renderItem }: ListProps<T>) {
    return data.map((item, index) => { return renderItem(item, index) });
}