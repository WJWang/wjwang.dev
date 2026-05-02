import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <p>
        In a Single Page Application (SPA) using React Redux, the logout action functions similarly to resetting the store's state back to its initial state, much like refreshing the page.
      </p>

      <h2>Logout Action</h2>

      <CodeBlock language="js">{`// action
function logout() {
  return {
    type: 'LOGOUT'
  }
}`}</CodeBlock>

      <h2>Implementation</h2>

      <p>A straightforward approach involves creating a root reducer wrapper:</p>

      <CodeBlock language="js">{`// in root reducer file
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

export default rootReducer;`}</CodeBlock>

      <p>
        This pattern intercepts the logout action to clear stored tokens and reset the application state to <code>undefined</code>, allowing the app reducers to reinitialize with default values.
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/react-redux-%E9%97%9C%E6%96%BC%E7%99%BB%E5%87%BA-d0e90edf196a">Medium</a></p>
    </Prose>
  );
}
