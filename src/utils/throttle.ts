/**
 * Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds.
 * The throttled function comes with a `cancel` method to cancel delayed `func` invocations and
 * a `flush` method to immediately invoke `func` if there's a pending invocation.
 * Provide `leading` and `trailing` options to control invocation behavior.
 *
 * @param func The function to throttle.
 * @param wait The number of milliseconds to throttle invocations to.
 * @param trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns the new throttled function.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  trailing: boolean = false
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T> | undefined;
  let lastCallTime = 0;

  function throttled(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    if (!lastCallTime) {
      lastCallTime = now;
    }
    const remaining = wait - (now - lastCallTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      result = func.apply(lastThis, lastArgs);
      if (!timeoutId) {
        lastArgs = lastThis = null;
      }
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now(); // Use current time for trailing edge
        timeoutId = null;
        result = func.apply(lastThis, lastArgs!);
        if (!timeoutId) {
          lastArgs = lastThis = null;
        }
      }, remaining);
    }
    return result;
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    lastCallTime = 0;
    timeoutId = lastArgs = lastThis = null;
  };

  throttled.flush = () => {
    if (timeoutId) {
       clearTimeout(timeoutId);
       timeoutId = null;
       lastCallTime = Date.now(); // Treat flush as an invocation time
       result = func.apply(lastThis, lastArgs!);
       lastArgs = lastThis = null;
    }
    return result;
  };

  return throttled as T & { cancel: () => void; flush: () => ReturnType<T> | undefined };
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * The debounced function comes with a `cancel` method to cancel delayed `func` invocations and
 * a `flush` method to immediately invoke `func` if there's a pending invocation.
 * 
 * Debouncing is ideal for text input handling as it waits until typing has stopped before triggering
 * the function, unlike throttling which may execute during typing.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param immediate Specify invoking on the leading edge of the timeout.
 * @returns Returns the new debounced function.
 */
import { Logger } from './logger'; // Import Logger

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T & { cancel: () => void; flush: () => ReturnType<T> | undefined } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T> | undefined;

  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    Logger.debug(`Debounce called, wait time: ${wait}ms, has existing timeout: ${timeoutId !== null}`);
    
    const context = this;
    
    // Always clear the previous timeout if it exists
    if (timeoutId) {
      Logger.debug(`Clearing previous debounce timeout`);
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Save the latest arguments and context
    lastArgs = args;
    lastThis = context;

    // Function to execute after the debounce period
    const later = () => {
      Logger.debug(`Debounce timeout expired, executing function`);
      timeoutId = null;
      if (!immediate) {
        result = func.apply(context, args);
        // Clean up references to prevent memory leaks
        if (!timeoutId) {
          lastArgs = lastThis = null;
        }
      }
    };

    // If immediate execution is requested and we're not currently waiting, execute now
    const callNow = immediate && !timeoutId;
    
    // Set a new timeout
    Logger.debug(`Setting new debounce timeout for ${wait}ms`);
    timeoutId = setTimeout(later, wait);

    // If we should call immediately, do so
    if (callNow) {
      Logger.debug(`Immediate execution requested`);
      result = func.apply(context, args);
      lastArgs = lastThis = null;
    }

    return result;
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = lastArgs = lastThis = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      if (!immediate) {
        result = func.apply(lastThis, lastArgs!);
        lastArgs = lastThis = null;
      }
    }
    return result;
  };

  return debounced as T & { cancel: () => void; flush: () => ReturnType<T> | undefined };
}
