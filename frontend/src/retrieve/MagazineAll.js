import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Helmet } from "react-helmet";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ScaleLoader from "react-spinners/ScaleLoader";
import { formatDistanceToNow, format } from "date-fns";
import DataTable from "react-data-table-component";

import useDataApi from "../utils/data-api";
import Header from "../components/Header";
import MagazineExpand from "./MagazineExpand";

const MagazineAll = () => {
  const [{ data, loading, error }] = useDataApi("/api/views/magazine/all", {
    data: {},
  });
  let content;

  if (error) {
    content = (
      <>
        <h3>An Error Occurred</h3>
        <p>An error occurred trying to load all the magazines:</p>
        <p>{error.message}</p>
      </>
    );
  } else if (loading) {
    content = (
      <div style={{ textAlign: "center" }}>
        <ScaleLoader />
      </div>
    );
  } else {
    let magazines = data.magazines;
    let columns = [
      {
        name: <b>Name</b>,
        selector: "name",
        sortable: true,
      },
      {
        name: <b>Issues</b>,
        selector: "issues",
        sortable: true,
      },
      {
        name: <b>Added</b>,
        selector: "createdAt",
        sortable: true,
        maxWidth: "20%",
        hide: "sm",
        format: (row) => {
          const now = new Date(row.createdAt);
          const show = format(now, "PPpp");
          const title = formatDistanceToNow(now);
          return <span title={`${title} ago`}>{show}</span>;
        },
      },
      {
        name: <b>Updated</b>,
        selector: "updatedAt",
        sortable: true,
        maxWidth: "20%",
        hide: "md",
        format: (row) => {
          const now = new Date(row.updatedAt);
          const show = format(now, "PPpp");
          const title = formatDistanceToNow(now);
          return <span title={`${title} ago`}>{show}</span>;
        },
      },
    ];

    content = (
      <>
        <Row>
          <Col>
            <Header>Magazines</Header>
          </Col>
          <Col className="text-right">
            <LinkContainer to="/magazines/create">
              <Button>New</Button>
            </LinkContainer>
          </Col>
        </Row>
        <Row>
          <Col>
            <DataTable
              striped
              responsive
              dense
              highlightOnHover
              pointerOnHover
              pagination
              paginationPerPage={25}
              expandableRows
              expandOnRowClicked
              expandableRowsHideExpander
              expandableRowsComponent={<MagazineExpand />}
              defaultSortField="name"
              columns={columns}
              data={magazines}
            />
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Magazines</title>
      </Helmet>
      <Container className="mt-2">{content}</Container>
    </>
  );
};

export default MagazineAll;
