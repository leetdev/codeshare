import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import Document from '../containers/Document'
import Home from '../containers/Home'

export const App = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <Home/>
      </Route>
      <Route path="/:id([0-9a-f]{32})">
        <Document/>
      </Route>
      <Route path="*">
        <Redirect to="/"/>
      </Route>
    </Switch>
  </Router>
)
