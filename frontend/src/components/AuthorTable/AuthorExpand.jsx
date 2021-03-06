import React from "react";
import PropTypes from "prop-types";
import { LinkContainer } from "react-router-bootstrap";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import FormatAuthorAliases from "../FormatAuthorAliases";

const AuthorExpand = ({ data: author }) => {
  if (!author) return null;

  return (
    <Container fluid className="mt-2 mb-3">
      <Row>
        <Col>
          <LinkContainer to={`/authors/${author.id}`}>
            <Button>View</Button>
          </LinkContainer>
          &nbsp;
          <LinkContainer to={`/authors/update/${author.id}`}>
            <Button>Edit</Button>
          </LinkContainer>
        </Col>
      </Row>
      <Row>
        <Col>
          <strong>
            {author.aliases.length === 1 ? "Alias: " : "Aliases: "}
          </strong>
          {author.aliases.length ? (
            <FormatAuthorAliases aliases={author.aliases} />
          ) : (
            "none"
          )}
        </Col>
      </Row>
    </Container>
  );
};

AuthorExpand.propTypes = { data: PropTypes.object };

AuthorExpand.defaultProps = { data: null };

export default AuthorExpand;
