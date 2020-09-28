import React from "react";
import { useParams } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { useQuery } from "react-query";
import { Helmet } from "react-helmet";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ScaleLoader from "react-spinners/ScaleLoader";

import apiEndpoint from "../../utils/api-endpoint";
import Header from "../../components/Header";
import FormatDate from "../../components/FormatDate";
import IssueTable from "../../components/IssueTable";

const ShowMagazine = () => {
  const { magazineId } = useParams();

  const url = `${apiEndpoint}/api/magazines/${magazineId}/withIssues`;

  const { isLoading, error, data } = useQuery(
    ["magazine-with-issues", magazineId],
    () => {
      return fetch(url).then((res) => res.json());
    }
  );

  if (isLoading) {
    return (
      <div className="text-center">
        <ScaleLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <strong>Error: {error.message}</strong>
      </div>
    );
  }

  const magazine = data.magazine;

  return (
    <>
      <Helmet>
        <title>Magazine: {magazine.name}</title>
      </Helmet>
      <Row className="my-3">
        <Col xs={9}>
          <Header>Magazine: {magazine.name}</Header>
        </Col>
        <Col className="text-right" xs={3}>
          <LinkContainer to={`/magazines/update/${magazine.id}`}>
            <Button>Edit</Button>
          </LinkContainer>
        </Col>
      </Row>
      <Row>
        <Col xs={6} sm={4} md={2} xl={1} className="text-right">
          <strong>Added:</strong>
        </Col>
        <Col>
          <FormatDate date={magazine.createdAt} />
        </Col>
      </Row>
      <Row>
        <Col xs={6} sm={4} md={2} xl={1} className="text-right">
          <strong>Updated:</strong>
        </Col>
        <Col>
          <FormatDate date={magazine.updatedAt} />
        </Col>
      </Row>
      <Row>
        <Col xs={6} sm={4} md={2} xl={1} className="text-right">
          <strong>Language:</strong>
        </Col>
        <Col>{magazine.language || "English"}</Col>
      </Row>
      <Row>
        <Col xs={6} sm={4} md={2} xl={1} className="text-right">
          <strong>Aliases:</strong>
        </Col>
        <Col>{magazine.aliases || "none"}</Col>
      </Row>
      <Row>
        <Col xs={6} sm={4} md={2} xl={1} className="text-right">
          <strong>Notes:</strong>
        </Col>
        <Col>{magazine.notes || "none"}</Col>
      </Row>
      <Row>
        <Col>
          <IssueTable data={magazine.issues} />
        </Col>
      </Row>
    </>
  );
};

export default ShowMagazine;
