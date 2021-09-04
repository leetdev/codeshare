import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import {Home} from './Home'

export const App = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <Home/>
      </Route>
      <Route path="*">
        <Redirect to="/"/>
      </Route>
    </Switch>
  </Router>
)
