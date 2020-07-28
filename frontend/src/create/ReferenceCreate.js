import React, { useState, useContext } from "react";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ScaleLoader from "react-spinners/ScaleLoader";

import AppContext from "../AppContext";
import useDataApi from "../utils/data-api";
import setupCRUDHandler from "../utils/crud";
import Header from "../components/Header";
import ReferenceForm from "../forms/ReferenceForm";
import Notifications from "../components/Notifications";

const ReferenceCreate = () => {
  const { multientry, toggleMultientry } = useContext(AppContext);
  const [state, setState] = useState({
    notifications: [],
    createdReference: null,
  });
  const [{ data, loading, error }] = useDataApi(
    "/api/views/combo/editreference",
    {
      data: {},
    }
  );

  const { notifications, createdReference } = state;
  let content;

  if (error) {
    content = (
      <>
        <h3>An Error Occurred</h3>
        <p>An error occurred trying to load data:</p>
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
    const { recordtypes, magazines, languages, authorlist } = data;

    const crudHandler = setupCRUDHandler({
      type: "reference",
      onSuccess: (data, formikBag) => {
        const { reference, authorsAdded, notifications } = data;

        reference.createdAt = new Date();
        reference.updatedAt = new Date();

        // If any new authors were added, put them in the master-list that is
        // used by the Typeahead component.
        authorsAdded.forEach((author) => authorlist.push(author));

        formikBag.resetForm();

        setState({ ...state, notifications: [] });
        setState({
          notifications,
          createdReference: reference,
        });
      },
      onError: (error) => {
        const notes = [
          {
            status: "error",
            result: "Create error",
            resultMessage: `Error during creation: ${error.message}`,
          },
        ];
        setState({ ...state, notifications: [] });
        setState({ ...state, notifications: notes });
      },
    });

    const submitHandler = (values, formikBag) => {
      crudHandler(values, formikBag);
      formikBag.setSubmitting(false);
    };

    if (createdReference && !multientry) {
      return (
        <Redirect
          push
          to={{
            pathname: `/references/update/${createdReference.id}`,
            state: {
              reference: createdReference,
              notifications,
            },
          }}
        />
      );
    }

    const emptyReference = {
      name: "",
      authors: [],
      type: "",
      isbn: "",
      language: "",
      keywords: "",
      RecordTypeId: "",
      MagazineId: "",
      MagazineIssueNumber: "",
    };

    content = (
      <>
        <Row>
          <Col>
            <Header>Reference Creation</Header>
          </Col>
          <Col className="text-right">
            <div className="mr-0 pr-0 align-middle">
              <span>Enter multiple records: </span>
              <Form.Check
                id="enterMultiple"
                inline
                custom
                type="switch"
                className="mr-0 pr-0 align-middle"
                label=""
                checked={multientry}
                onChange={toggleMultientry}
              />
            </div>
          </Col>
        </Row>
        <ReferenceForm
          {...data}
          recordtypes={recordtypes}
          magazines={magazines}
          languages={languages}
          authorlist={authorlist}
          submitHandler={submitHandler}
          action="create"
          reference={emptyReference}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reference Create</title>
      </Helmet>
      <Notifications notifications={notifications} />
      <Container className="mt-2">{content}</Container>
    </>
  );
};

export default ReferenceCreate;
