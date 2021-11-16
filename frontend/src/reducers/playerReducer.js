const playerReducer = (state = true, action) => {
    switch (action.type) {
      case "play":
        state = true;
        return state;
      case "pause":
        state = false;
        return state;
      default:
        return state;
    }
  };
  
  
  
  export default playerReducer;
  