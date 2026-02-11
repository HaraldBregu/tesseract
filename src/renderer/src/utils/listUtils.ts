export const bulletStyleSet = new Set(['disc', 'circle', 'square']);
export const orderedStyleSet = new Set(['decimal', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman']);

export const getListTypeByStyle = (listStyle: ListStyle): 'BULLET' | 'ORDER' | '' => {
    if (bulletStyleSet.has(listStyle)) {
        return 'BULLET';
    } else if (orderedStyleSet.has(listStyle)) {
        return 'ORDER';
    } else {
        return '';
    }
}