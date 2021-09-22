import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'

import {documentIdPattern} from '~common/utils'
import Document from '~main/containers/Document'
import Home from '~main/containers/Home'

const App = () => (
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

export default App
