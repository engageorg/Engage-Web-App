const shouldDiscardRemoteElement = (localAppState, local, remote) => {
    if (local &&
        // local element is being edited
        (local.id === localAppState.editingElement?.id ||
            local.id === localAppState.resizingElement?.id ||
            local.id === localAppState.draggingElement?.id ||
            // local element is newer
            local.version > remote.version ||
            // resolve conflicting edits deterministically by taking the one with
            // the lowest versionNonce
            (local.version === remote.version &&
                local.versionNonce < remote.versionNonce))) {
        return true;
    }
    return false;
};
const getElementsMapWithIndex = (elements) => elements.reduce((acc, element, idx) => {
    acc[element.id] = [element, idx];
    return acc;
}, {});
export const reconcileElements = (localElements, remoteElements, localAppState) => {
    const localElementsData = getElementsMapWithIndex(localElements);
    const reconciledElements = localElements.slice();
    const duplicates = new WeakMap();
    let cursor = 0;
    let offset = 0;
    let remoteElementIdx = -1;
    for (const remoteElement of remoteElements) {
        remoteElementIdx++;
        const local = localElementsData[remoteElement.id];
        if (shouldDiscardRemoteElement(localAppState, local?.[0], remoteElement)) {
            if (remoteElement.parent) {
                delete remoteElement.parent;
            }
            continue;
        }
        if (local) {
            // mark for removal since it'll be replaced with the remote element
            duplicates.set(local[0], true);
        }
        // parent may not be defined in case the remote client is running an older
        // excalidraw version
        const parent = remoteElement.parent || remoteElements[remoteElementIdx - 1]?.id || null;
        if (parent != null) {
            delete remoteElement.parent;
            // ^ indicates the element is the first in elements array
            if (parent === "^") {
                offset++;
                if (cursor === 0) {
                    reconciledElements.unshift(remoteElement);
                    localElementsData[remoteElement.id] = [
                        remoteElement,
                        cursor - offset,
                    ];
                }
                else {
                    reconciledElements.splice(cursor + 1, 0, remoteElement);
                    localElementsData[remoteElement.id] = [
                        remoteElement,
                        cursor + 1 - offset,
                    ];
                    cursor++;
                }
            }
            else {
                let idx = localElementsData[parent]
                    ? localElementsData[parent][1]
                    : null;
                if (idx != null) {
                    idx += offset;
                }
                if (idx != null && idx >= cursor) {
                    reconciledElements.splice(idx + 1, 0, remoteElement);
                    offset++;
                    localElementsData[remoteElement.id] = [
                        remoteElement,
                        idx + 1 - offset,
                    ];
                    cursor = idx + 1;
                }
                else if (idx != null) {
                    reconciledElements.splice(cursor + 1, 0, remoteElement);
                    offset++;
                    localElementsData[remoteElement.id] = [
                        remoteElement,
                        cursor + 1 - offset,
                    ];
                    cursor++;
                }
                else {
                    reconciledElements.push(remoteElement);
                    localElementsData[remoteElement.id] = [
                        remoteElement,
                        reconciledElements.length - 1 - offset,
                    ];
                }
            }
            // no parent z-index information, local element exists → replace in place
        }
        else if (local) {
            reconciledElements[local[1]] = remoteElement;
            localElementsData[remoteElement.id] = [remoteElement, local[1]];
            // otherwise push to the end
        }
        else {
            reconciledElements.push(remoteElement);
            localElementsData[remoteElement.id] = [
                remoteElement,
                reconciledElements.length - 1 - offset,
            ];
        }
    }
    const ret = reconciledElements.filter((element) => !duplicates.has(element));
    return ret;
};
