const outputModalReducer = (state = false, action) => {

    switch(action.type){
        case "outputtrue":
            state = true
            return state
        case "outputfalse":
            state = false
            return state
        default:
            return state
    }
}

export const outputSrcReducer = (state = "", action) => {

    switch(action.type){
        case "setSrcdoc":
            state = action.payload
            return state
        default:
            return state
    }
}

export default outputModalReducer;