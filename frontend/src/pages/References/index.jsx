import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import Container from "react-bootstrap/Container";

import NavHeader from "../../components/NavHeader";
import ShowReference from "./ShowReference";
import UpdateReference from "./UpdateReference";
import ListReferences from "./ListReferences";

const References = () => {
  const match = useRouteMatch();

  return (
    <>
      <NavHeader />
      <Container>
        <Switch>
          <Route
            path={`${match.path}/:referenceId(\\d+)`}
            component={ShowReference}
          />
          <Route
            path={`${match.path}/update/:referenceId(\\d+)`}
            component={UpdateReference}
          />
          <Route path={match.path} component={ListReferences} />
        </Switch>
      </Container>
    </>
  );
};

export default References;
