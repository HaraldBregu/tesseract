import { call } from 'redux-saga/effects';

// @ts-ignore
function* fetchDataSaga() {
    try {
        // @ts-ignore
        const data: string[] = yield call(fetchDataFromAPI);
    } catch (error) {
        // console.log('Error fetching data:', error);
    }
}

function fetchDataFromAPI(): Promise<string[]> {
    return new Promise((resolve) =>
        setTimeout(() => resolve(['Item 1', 'Item 2', 'Item 3']), 1000)
    );
}

export default function* editorSaga() {
}
