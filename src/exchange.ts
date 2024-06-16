import { Shareable } from "./Shareable";

/**
 * exchange(mine to release, yours to addRef)
 * @param mine to release.
 * @param yours to addRef.
 * @returns
 */
export function exchange<T extends Shareable>(mine: T, yours: T): T {
    if (mine !== yours) {
        if (yours && yours.addRef) {
            yours.addRef();
        }
        if (mine && mine.release) {
            mine.release();
        }
        return yours;
    } else {
        // Keep mine, it's the same as yours anyway.
        return mine;
    }
}
