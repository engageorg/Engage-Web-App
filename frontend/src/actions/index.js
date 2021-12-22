export const js = () => {
    return {
        type: "js"
    };
};

export const css = () => {
    return {
        type: "css"
    };
};

export const html = () => {
    return {
        type: "html"
    };
};

export const outputModalTrue = () => {
    return {
        type: "outputtrue"
    };
};

export const outputModalFalse = () => {
    return {
        type: "outputfalse"
    };
};

export const setSrcDocs = () => {
    return {
        type : "setSrcdoc",
    }
}

export const c = () => {
    return {
        type : "c",
    }
}

export const c99 = () => {
    return {
        type : "c99",
    }
}

export const cpp = () => {
    return {
        type : "cpp",
    }
}

export const cpp14 = () => {
    return {
        type : "cpp14",
    }
}

export const cpp17 = () => {
    return {
        type : "cpp17",
    }
}

export const python2 = () => {
    return {
        type : "python2",
    }
}

export const python3 = () => {
    return {
        type : "python3",
    }
}

export const changefile = (file_id) => {
    return {
        type : "changefile",
        f_id : file_id
    }
}