import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import Document from '../containers/Document'
import Home from '../containers/Home'
import {documentIdPattern} from '../utils'

export const App = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <Home/>
      </Route>
      <Route path={`/:id(${documentIdPattern})`}>
        <Document/>
      </Route>
      <Route path="*">
        <Redirect to="/"/>
      </Route>
    </Switch>
  </Router>
)
