# React Redux 關於登出

In a Single Page Application (SPA) using React Redux, the logout action functions similarly to resetting the store's state back to its initial state, much like refreshing the page.

## Logout Action

```javascript
// action
function logout() {
  return {
    type: 'LOGOUT'
  }
}
```

## Implementation

A straightforward approach involves creating a root reducer wrapper:

```javascript
// in root reducer file
const appReducer = combineReducers({
  ... // app中所需的reducers
});

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    localStorage.removeItem('accessToken');
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
```

This pattern intercepts the logout action to clear stored tokens and reset the application state to `undefined`, allowing the app reducers to reinitialize with default values.
