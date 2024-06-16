let statistics: {
    [uuid: string]: { refCount: number; name: string; zombie: boolean };
} = {};
let running = 0;
let chatty = true;
// let trace = false;
// let traceName: string | undefined = void 0;

const LOGGING_NAME_REF_CHANGE = "refChange";

function prefix(message: string): string {
    return LOGGING_NAME_REF_CHANGE + ": " + message;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function log(message: string): void {
    if (chatty) {
        console.log(prefix(message));
    }
}

function warn(message: string): void {
    console.warn(prefix(message));
}

function error(message: string): void {
    console.error(prefix(message));
}

function garbageCollect(): void {
    const uuids: string[] = Object.keys(statistics);
    uuids.forEach(function (uuid: string) {
        const element = statistics[uuid];
        if (element.refCount === 0) {
            delete statistics[uuid];
        }
    });
}

function computeOutstanding(): number {
    const uuids = Object.keys(statistics);
    let total = 0;
    for (const uuid of uuids) {
        const statistic = statistics[uuid];
        total += statistic.refCount;
    }
    return total;
}

/**
 * @returns the number of times that `start()` was called.
 */
function start(): number {
    if (running === 0) {
        garbageCollect();
    }
    running++;
    return running;
}

function stop(): number {
    running--;
    if (running === 0) {
        garbageCollect();
        const outstanding = computeOutstanding();
        return outstanding;
    } else {
        return 0;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ensureRunning(name: string, change: number): void {
    if (running === 0) {
        garbageCollect();
        running++;
    }
    if (running < 0) {
        throw new Error("mismatch");
    }
}

function mustBeRunning(name: string, change: number): void {
    ensureRunning(name, change);
    if (running === 0) {
        const msg = `must be running for ${name}, ${change}`;
        error(msg);
        throw new Error(msg);
    }
    if (running < 0) {
        throw new Error("mismatch");
    }
}

function outstandingMessage(outstanding: number): string {
    return `There are ${outstanding} outstanding reference counts.`;
}

function dump(): number {
    try {
        garbageCollect();
        const outstanding = computeOutstanding();
        if (outstanding > 0) {
            warn(outstandingMessage(outstanding));
            warn(JSON.stringify(statistics, null, 2));
        } else {
            log(outstandingMessage(outstanding));
        }
        return outstanding;
    } catch (e) {
        console.warn(e);
        return -1;
    }
}

function outstanding(): number {
    try {
        garbageCollect();
        return computeOutstanding();
    } catch (e) {
        console.warn(e);
        return -1;
    }
}

/**
 * Record reference count changes and debug reference counts.
 *
 * Instrumenting reference counting:
 *   constructor():
 *     refChange(uuid, 'YourClassName',+1);
 *   addRef():
 *     refChange(uuid, 'YourClassName',+1);
 *   release():
 *     refChange(uuid, 'YourClassName',-1);
 *
 * Debugging reference counts:
 *   Start tracking reference counts:
 *     refChange('start'[, 'where']);
 *     The system will record reference count changes.
 *   Stop tracking reference counts:
 *     refChange('stop'[, 'where']);
 *     The system will compute the total outstanding number of reference counts.
 *   Dump tracking reference counts:
 *     refChange('dump'[, 'where']);
 *     The system will log net reference count changes to the console.
 *   Don't track reference counts (default):
 *     refChange('reset'[, 'where']);
 *     The system will clear statistics and enter will not record changes.
 *   Trace reference counts for a particular class:
 *     refChange('trace', 'YourClassName');
 *     The system will report reference count changes on the specified class.
 *
 * Returns the number of outstanding reference counts for the 'stop' command.
 */
export function refChange(uuid: string, name?: string, change = 0): number | undefined {
    if (change === +1) {
        if (typeof name === "string") {
            mustBeRunning(name, change);
            let element = statistics[uuid];
            if (!element) {
                element = { refCount: 0, name: name, zombie: false };
                statistics[uuid] = element;
            } else {
                // It's more efficient to synchronize the name than by using a change of zero.
                element.name = name;
            }
            element.refCount += change;
        } else {
            throw new Error("name must be a string");
        }
    } else if (change === -1) {
        if (typeof name === "string") {
            mustBeRunning(name, change);
            const element = statistics[uuid];
            if (element) {
                element.refCount += change;
                if (element.refCount === 0) {
                    element.zombie = true;
                } else if (element.refCount < 0) {
                    error(`refCount < 0 for ${name}`);
                }
            } else {
                error(change + " on " + uuid + " @ " + name);
            }
        } else {
            throw new Error("name must be a string");
        }
    } else if (change === 0) {
        // When the value of change is zero, the uuid is either a command or a method on an exisiting uuid.
        if (uuid === "stop") {
            deprecated(uuid);
            return stop();
        } else {
            if (uuid === "dump") {
                deprecated(uuid);
                return dump();
            } else if (uuid === "start") {
                deprecated(uuid);
                return start();
            } else if (uuid === "reset") {
                deprecated(uuid);
                statistics = {};
            } else if (uuid === "quiet") {
                // Ignore.
            } else if (uuid === "trace") {
                deprecated(uuid);
            } else {
                throw new Error(prefix(`Unexpected command uuid => ${uuid}, name => ${name}`));
            }
        }
    } else {
        throw new Error(prefix("change must be +1 or -1 for normal recording, or 0 for logging to the console."));
    }
    return void 0;
}

/**
 * @returns
 * `start`: The number of times `start` was called.
 */
export function refCommand(command: "start" | "stop" | "dump" | "outstanding" | "quiet" | "reset" | "trace"): number {
    switch (command) {
        case "start": {
            return start();
        }
        case "stop": {
            return stop();
        }
        case "dump": {
            return dump();
        }
        case "outstanding": {
            return outstanding();
        }
        case "quiet": {
            chatty = false;
            break;
        }
        case "reset": {
            statistics = {};
            break;
        }
        case "trace": {
            statistics = {};
            break;
        }
        default: {
            console.warn(`Unexpected command ${JSON.stringify(command)}`);
        }
    }
    return void 0;
}

function deprecated(command: string) {
    console.warn(`refChange('${command}') is deprecated. Please use refCommand('${command}') instead.`);
}
