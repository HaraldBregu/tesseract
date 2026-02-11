/**
 * Configuration for object migration to support backward compatibility
 */
export interface MigrationConfig {
    /**
     * Map of old property names to new property names
     * Supports dot notation for nested properties (e.g., 'old.nested.prop' -> 'new.nested.prop')
     */
    renames?: Record<string, string>;
    /**
     * Map of property paths to default values
     * Properties will be added if they don't exist
     * Supports dot notation for nested properties
     */
    defaults?: Record<string, unknown>;
    /**
     * Map of property paths to transformation functions
     * Functions receive the current value and return the transformed value
     * Supports dot notation for nested properties
     */
    transforms?: Record<string, (value: unknown) => unknown>;
    /**
     * Map of property names to deletion functions
     * Functions receive the property value and the entire object, and return true if the object should be deleted
     * Objects matching deletion conditions will be removed from arrays or excluded from results
     */
    remove?: Record<string, (value: unknown, data: unknown) => boolean>;
  }
  
  /**
   * Deep clones an object, handling arrays, objects, and primitives
   */
  function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
  
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(item => deepClone(item)) as unknown as T;
    }
  
    const cloned = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
  
    return cloned as T;
  }
  
  /**
   * Gets a nested property value using dot notation path
   */
  function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;
  
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }
  
    return current;
  }
  
  /**
   * Sets a nested property value using dot notation path
   * Creates intermediate objects as needed
   */
  function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = obj;
  
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null || Array.isArray(current[key])) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
  
    current[keys[keys.length - 1]] = value;
  }
  
  /**
   * Checks if a property path exists in the object
   */
  function hasNestedProperty(obj: Record<string, unknown>, path: string): boolean {
    const keys = path.split('.');
    let current: unknown = obj;
  
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return false;
      }
      if (!(key in (current as Record<string, unknown>))) {
        return false;
      }
      current = (current as Record<string, unknown>)[key];
    }
  
    return true;
  }
  
  /**
   * Removes a nested property using dot notation path
   * Returns a new object without mutating the original
   */
  function removeNestedProperty(obj: Record<string, unknown>, path: string): Record<string, unknown> {
    const keys = path.split('.');
    const result = { ...obj };
  
    if (keys.length === 1) {
      delete result[keys[0]];
      return result;
    }
  
    const firstKey = keys[0];
    if (firstKey in result && typeof result[firstKey] === 'object' && result[firstKey] !== null && !Array.isArray(result[firstKey])) {
      const remainingPath = keys.slice(1).join('.');
      result[firstKey] = removeNestedProperty(result[firstKey] as Record<string, unknown>, remainingPath);
    }
  
    return result;
  }
  
  /**
   * Checks if an object should be deleted based on deletion conditions
   */
  function shouldDeleteObject(obj: unknown, config: MigrationConfig): boolean {
    if (!config.remove || typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return false;
    }

    const record = obj as Record<string, unknown>;
    
    for (const [propertyName, deleteFn] of Object.entries(config.remove)) {
      if (propertyName in record) {
        const propertyValue = record[propertyName];
        if (deleteFn(propertyValue, record)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Recursively processes an object or array, applying migrations
   */
  function traverseAndMigrate(
    obj: unknown,
    config: MigrationConfig,
    currentPath: string = ''
  ): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      const filtered = obj
        .map((item, index) => 
          traverseAndMigrate(item, config, currentPath ? `${currentPath}[${index}]` : `[${index}]`)
        )
        .filter(item => item !== undefined);
      return filtered;
    }
  
    // Handle objects
    if (typeof obj === 'object') {
      // Check if this object should be deleted before processing
      if (shouldDeleteObject(obj, config)) {
        return undefined; // Signal deletion to parent array filter
      }

      const record = obj as Record<string, unknown>;
      const result: Record<string, unknown> = {};

      // First, copy all properties recursively
      for (const key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) {
          const fullPath = currentPath ? `${currentPath}.${key}` : key;
          const migratedValue = traverseAndMigrate(record[key], config, fullPath);
          // Only add non-undefined values (undefined signals deletion)
          if (migratedValue !== undefined) {
            result[key] = migratedValue;
          }
        }
      }
  
      // Apply renames - handle at root level only
      if (config.renames) {
        for (const [oldPath, newPath] of Object.entries(config.renames)) {
          const oldPathParts = oldPath.split('.');
          const newPathParts = newPath.split('.');
          
          // Only process renames that start at the current level
          if (oldPathParts.length === 1 && oldPathParts[0] in result) {
            // Simple property rename
            const value = result[oldPathParts[0]];
            delete result[oldPathParts[0]];
            
            if (newPathParts.length === 1) {
              result[newPathParts[0]] = value;
            } else {
              // Move to nested location
              setNestedValue(result, newPath, value);
            }
          } else if (oldPathParts.length > 1 && oldPathParts[0] in result) {
            // Nested property rename - get the value and move it
            const nestedObj = result[oldPathParts[0]];
            if (typeof nestedObj === 'object' && nestedObj !== null && !Array.isArray(nestedObj)) {
              const remainingOldPath = oldPathParts.slice(1).join('.');
              const value = getNestedValue(nestedObj as Record<string, unknown>, remainingOldPath);
              
              if (value !== undefined) {
                // Remove from old location
                result[oldPathParts[0]] = removeNestedProperty(nestedObj as Record<string, unknown>, remainingOldPath);
                
                // Add to new location
                if (newPathParts.length === 1) {
                  result[newPathParts[0]] = value;
                } else {
                  setNestedValue(result, newPath, value);
                }
              }
            }
          }
        }
      }
  
      // Apply defaults
      if (config.defaults) {
        for (const [path, defaultValue] of Object.entries(config.defaults)) {
          const pathParts = path.split('.');
          
          if (pathParts.length === 1 && !(pathParts[0] in result)) {
            result[pathParts[0]] = deepClone(defaultValue);
          } else if (pathParts.length > 1 && pathParts[0] in result) {
            const nestedObj = result[pathParts[0]];
            if (typeof nestedObj === 'object' && nestedObj !== null && !Array.isArray(nestedObj)) {
              const remainingPath = pathParts.slice(1).join('.');
              if (!hasNestedProperty(nestedObj as Record<string, unknown>, remainingPath)) {
                setNestedValue(nestedObj as Record<string, unknown>, remainingPath, deepClone(defaultValue));
              }
            }
          }
        }
      }
  
      // Apply transforms
      if (config.transforms) {
        for (const [path, transformFn] of Object.entries(config.transforms)) {
          const pathParts = path.split('.');
          
          if (pathParts.length === 1 && pathParts[0] in result) {
            result[pathParts[0]] = transformFn(result[pathParts[0]]);
          } else if (pathParts.length > 1 && pathParts[0] in result) {
            const nestedObj = result[pathParts[0]];
            if (typeof nestedObj === 'object' && nestedObj !== null && !Array.isArray(nestedObj)) {
              const remainingPath = pathParts.slice(1).join('.');
              const value = getNestedValue(nestedObj as Record<string, unknown>, remainingPath);
              if (value !== undefined) {
                setNestedValue(nestedObj as Record<string, unknown>, remainingPath, transformFn(value));
              }
            }
          }
        }
      }
  
      return result;
    }
  
    // Primitive values
    return obj;
  }
  
  /**
   * Migrates an object to support backward compatibility by updating properties
   * 
   * This function supports:
   * - Renaming properties (including nested properties using dot notation)
   * - Adding default values for missing properties
   * - Transforming existing property values
   * - Deleting objects that match specific conditions
   * 
   * @param object - The object to migrate (will not be mutated)
   * @param migrations - Configuration object specifying the migrations to apply
   * @returns A new migrated object
   * 
   * @example
   * ```typescript
   * const oldObject = {
   *   oldName: 'value',
   *   config: { oldSetting: true },
   *   items: [
   *     { oldProp: 1 },
   *     { type: 'paragraph', value: null, props: null },
   *     { type: 'heading', value: 'Title' }
   *   ]
   * };
   * 
   * const migrated = migrateObject(oldObject, {
   *   renames: {
   *     'oldName': 'newName',
   *     'config.oldSetting': 'settings.newSetting'
   *   },
   *   defaults: {
   *     'version': '2.0',
   *     'enabled': true
   *   },
   *   transforms: {
   *     'items': (arr) => arr.map(item => ({ ...item, migrated: true }))
   *   },
   *   remove: {
   *     'type': (value, data) => {
   *       if (value === 'paragraph' && data['value'] === null && data['props'] === null) {
   *         return true;
   *       }
   *       return false;
   *     }
   *   }
   * });
   * // Result: items array will not contain the paragraph object with null value and props
   * ```
   */
  export function migrateObject(
    object: Record<string, unknown>,
    migrations: MigrationConfig
  ): Record<string, unknown> {
    if (!object || typeof object !== 'object' || Array.isArray(object)) {
      return object;
    }
  
    const cloned = deepClone(object);
    return traverseAndMigrate(cloned, migrations) as Record<string, unknown>;
  }
  
  