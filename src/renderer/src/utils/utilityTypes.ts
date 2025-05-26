export type RequiredProp<T, P extends keyof T> = T & Required<Pick<T, P>>;
