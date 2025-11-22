//
// ===========================
//   1. createStore (base)
// ===========================
//

function createStoreBase(reducer, preloadedState) {
  let currentState = preloadedState;
  let listeners = [];

  function getState() {
    return currentState;
  }

  function dispatch(action) {
    currentState = reducer(currentState, action);
    listeners.forEach((l) => l());
    return action;
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  // 初始化擋住 undefined state
  dispatch({ type: "@@redux/INIT" });

  return { dispatch, getState, subscribe };
}

//
// ===========================
//   2. 支援 enhancer 的 createStore
// ===========================
//

function createStore(reducer, preloadedState, enhancer) {
  // 處理 createStore(reducer, enhancer) 形式
  if (typeof preloadedState === "function" && enhancer === undefined) {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, preloadedState);
  }

  return createStoreBase(reducer, preloadedState);
}

//
// ===========================
//   3. applyMiddleware
// ===========================
//

function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);

    let dispatch = store.dispatch;

    // middleware API（只能用 getState + dispatch）
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };

    // 將每個 middleware 注入現在 store 的 API (getState, dispatch)
    const chain = middlewares.map((mw) => mw(middlewareAPI));

    // 將 dispatch 外部做封裝，讓執行 dispatch 時，可以先執行前面的 middleware，再執行最後的 dispatch
    dispatch = chain.reduceRight((next, mw) => mw(next), dispatch);

    return { ...store, dispatch };
  };
}

//
// ===========================
//   4. thunk middleware
// ===========================
//

const thunk = ({ dispatch, getState }) => {
  return (next) => {
    return (action) => {
      if (typeof action === "function") {
        return action(dispatch, getState);
      }
      return next(action);
    };
  };
};

//
// ===========================
//   5. logger middleware
// ===========================
//

const logger = ({ getState }) => {
  return (next) => {
    return (action) => {
      console.log("logger | before:", getState());
      const result = next(action);
      console.log("logger | after:", getState());
      return result;
    };
  };
};

//
// ===========================
//   6. reducer
// ===========================
//

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

//
// ===========================
//   7. 建立 store（含 thunk + logger）
// ===========================
//

const store = createStore(counterReducer, applyMiddleware(thunk, logger));

//
// ===========================
//   8. 測試用 action
// ===========================
//

// async thunk action
const incrementAsync = () => (dispatch) => {
  setTimeout(() => {
    dispatch({ type: "INCREMENT" });
  }, 1000);
};

store.subscribe(() => {
  console.log("subscribe | new state:", store.getState());
});

// 測試
store.dispatch({ type: "INCREMENT" });
store.dispatch(incrementAsync());
