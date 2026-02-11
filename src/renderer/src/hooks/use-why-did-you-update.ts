import { DependencyList, useEffect, useRef } from "react";

export function useWhyDidYouUpdate<T extends Record<string, any>>(name: string, props: T, dependencies: DependencyList = []) {
  const previousProps = useRef<T>(props);

  useEffect(() => {
    const allKeys = Object.keys({ ...previousProps.current, ...props });
    const changes: Record<string, { from: any; to: any }> = {};

    allKeys.forEach((key) => {
      if (previousProps.current[key] !== props[key]) {
        changes[key] = {
          from: previousProps.current[key],
          to: props[key],
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      console.warn("[why-did-you-update]", name, changes);
    }

    previousProps.current = props;
  }, dependencies);
}
