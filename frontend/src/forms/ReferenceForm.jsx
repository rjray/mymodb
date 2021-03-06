import React, { createRef } from "react";
import PropTypes from "prop-types";
import { useQuery } from "react-query";
import { LinkContainer } from "react-router-bootstrap";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import BeatLoader from "react-spinners/BeatLoader";
import { Typeahead, Highlighter } from "react-bootstrap-typeahead";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import {
  BsLink as IconLink,
  BsTrashFill as IconDelete,
  BsArrowCounterclockwise as IconRestore,
} from "react-icons/bs";
import * as Yup from "yup";

import "react-bootstrap-typeahead/css/Typeahead.css";

import compareVersion from "../utils/compare-version";
import { sortBy } from "../utils/no-lodash";
import FocusFormControl from "../components/CustomInputs/FocusFormControl";
import ReferenceType from "../components/CustomInputs/ReferenceType";
import Language from "../components/CustomInputs/Language";
import TagEditor from "../components/CustomInputs/TagEditor";
import {
  getAllRecordTypes,
  getAllMagazinesWithIssues,
  getAuthorNamesAndAliases,
} from "../utils/queries";

const sortByName = sortBy("name");

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .max(
      255,
      <em className="form-field-error">Name cannot exceed 255 characters</em>
    )
    .required(<em className="form-field-error">Name cannot be empty</em>),
  RecordTypeId: Yup.string().required(
    <em className="form-field-error">Must choose a record type</em>
  ),
  isbn: Yup.string()
    .max(
      15,
      <em className="form-field-error">
        ISBN cannot exceed 15 characters (no hyphens)
      </em>
    )
    .nullable(),
  MagazineIssueNumber: Yup.string()
    .max(
      50,
      <em className="form-field-error">
        Magazine issue label cannot exceed 50 characters
      </em>
    )
    .nullable(),
  authors: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .max(
          60,
          <em className="form-field-error">Name cannot exceed 60 characters</em>
        )
        .required(<em className="form-field-error">Name cannot be empty</em>),
    })
  ),
  type: Yup.string()
    .max(
      75,
      <em className="form-field-error">Type cannot exceed 75 characters</em>
    )
    .required(<em className="form-field-error">Type cannot be empty</em>),
  language: Yup.string()
    .max(
      50,
      <em className="form-field-error">Language cannot exceed 50 characters</em>
    )
    .nullable(),
  tags: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .max(
            75,
            <em className="form-field-error">
              Tag name cannot exceed 75 characters
            </em>
          )
          .required(
            <em className="form-field-error">Tag name cannot be empty</em>
          ),
      })
    )
    .required(<em className="form-field-error">Tags cannot be empty</em>),
});

const ReferenceForm = ({ reference, submitHandler, autoFocusRef }) => {
  const recordTypesQuery = useQuery("recordtypes", getAllRecordTypes);
  const magazinesQuery = useQuery(
    ["magazines", { withIssues: true }],
    getAllMagazinesWithIssues
  );
  const authorlistQuery = useQuery(
    ["authors", { namesAndAliases: true }],
    getAuthorNamesAndAliases
  );

  const initialValues = { ...reference };
  initialValues.tags.sort(sortByName);
  const issues = {};

  if (magazinesQuery.data?.magazines) {
    for (const magazine of magazinesQuery.data.magazines) {
      issues[magazine.id] = magazine.issues
        .map((i) => i.number)
        .sort(compareVersion);
    }
  }

  let newAuthorCounter = 0;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={submitHandler}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        handleReset,
        isSubmitting,
      }) => (
        <Form className="mt-3">
          <Form.Group as={Form.Row} controlId="name" className="mb-2">
            <Form.Label column sm={2} className="text-md-right text-sm-left">
              <strong>Name:</strong>
              <ErrorMessage name="name" component="p" />
            </Form.Label>
            <Col sm={10}>
              <Field
                as={FocusFormControl}
                type="text"
                name="name"
                innerRef={(el) => (autoFocusRef.current = el)}
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="Name"
                autoFocus
                data-lpignore="true"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Form.Row} controlId="RecordTypeId" className="mb-2">
            <Form.Label column sm={2} className="text-md-right text-sm-left">
              <strong>Record Type:</strong>
            </Form.Label>
            <Col sm={10}>
              <Container fluid className="pl-0">
                <Form.Group
                  as={Form.Row}
                  controlId="recordType"
                  className="mb-2"
                >
                  <Col sm={3}>
                    {recordTypesQuery.isLoading && (
                      <div className="mt-2">
                        <BeatLoader size={8} />
                      </div>
                    )}
                    {recordTypesQuery.isError && (
                      <em className="form-field-error">
                        Error loading types: {recordTypesQuery.error.message}
                      </em>
                    )}
                    {recordTypesQuery.data?.recordTypes && (
                      <>
                        <Field
                          as={Form.Control}
                          type="select"
                          component="select"
                          name="RecordTypeId"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          style={{ width: "100%", marginTop: "0.35rem" }}
                        >
                          <option value="">-- Choose --</option>
                          {recordTypesQuery.data.recordTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.description}
                            </option>
                          ))}
                        </Field>
                      </>
                    )}
                  </Col>
                </Form.Group>
              </Container>
            </Col>
          </Form.Group>
          {values.RecordTypeId === "1" && (
            <Form.Group as={Form.Row} controlId="isbn" className="mb-2">
              <Form.Label column sm={2} className="text-md-right text-sm-left">
                <strong>ISBN:</strong>
              </Form.Label>
              <Col sm={10}>
                <Container fluid className="pl-0">
                  <Form.Group as={Form.Row} controlId="isbn" className="mb-2">
                    <Col sm={3}>
                      <Field
                        as={Form.Control}
                        type="text"
                        name="isbn"
                        placeholder="ISBN"
                        data-lpignore="true"
                      />
                    </Col>
                  </Form.Group>
                </Container>
              </Col>
            </Form.Group>
          )}
          {(values.RecordTypeId === "2" || values.RecordTypeId === "3") && (
            <Form.Group as={Form.Row} controlId="magazine" className="mb-2">
              <Form.Label column sm={2} className="text-md-right text-sm-left">
                <strong>Magazine:</strong>
              </Form.Label>
              <Col sm={10}>
                {magazinesQuery.isLoading && (
                  <div className="mt-2">
                    <BeatLoader size={8} />
                  </div>
                )}
                {magazinesQuery.isError && (
                  <em className="form-field-error">
                    Error loading types: {magazinesQuery.error.message}
                  </em>
                )}
                {magazinesQuery.data?.magazines && (
                  <Container fluid className="pl-0">
                    <Form.Group
                      as={Form.Row}
                      controlId="magazine"
                      className="mb-2"
                    >
                      <Col sm={3}>
                        <Field
                          as={Form.Control}
                          type="select"
                          component="select"
                          name="MagazineId"
                          style={{ width: "100%", marginTop: "0.35rem" }}
                        >
                          <option value="">-- Choose --</option>
                          {magazinesQuery.data.magazines.map((magazine) => (
                            <option key={magazine.id} value={magazine.id}>
                              {magazine.name}
                            </option>
                          ))}
                        </Field>
                      </Col>
                      <Col sm={3}>
                        <Field
                          as={Form.Control}
                          type="text"
                          name="MagazineIssueNumber"
                          placeholder="Issue Number"
                          list="magazine-issues"
                          className="mt-1"
                          data-lpignore="true"
                        />
                        <datalist id="magazine-issues">
                          {values.MagazineId &&
                            issues[+values.MagazineId].map((issue) => (
                              <option key={issue} value={issue} />
                            ))}
                        </datalist>
                      </Col>
                    </Form.Group>
                  </Container>
                )}
              </Col>
            </Form.Group>
          )}
          <Form.Group as={Form.Row} controlId="authors" className="mb-2">
            <Form.Label column sm={2} className="text-md-right text-sm-left">
              <strong>Authors:</strong>
            </Form.Label>
            <Col sm={10}>
              {authorlistQuery.isLoading && (
                <div className="mt-2">
                  <BeatLoader size={8} />
                </div>
              )}
              {authorlistQuery.isError && (
                <em className="form-field-error">
                  Error loading types: {authorlistQuery.error.message}
                </em>
              )}
              {authorlistQuery.data?.authors && (
                <Container
                  fluid
                  className="mb-2 pb-0 px-0 d-flex flex-column justify-content-start"
                >
                  <FieldArray name="authors">
                    {(helpers) => (
                      <>
                        {values.authors.map((author, index) => (
                          <Form.Group
                            key={author.id}
                            as={Form.Row}
                            controlId={`author${index}`}
                            className="mb-2"
                          >
                            <Col sm={3}>
                              <Typeahead
                                id={`authors.${index}.name`}
                                name={`authors.${index}.name`}
                                labelKey="name"
                                clearButton
                                align="left"
                                maxResults={10}
                                paginate
                                minLength={2}
                                allowNew
                                newSelectionPrefix="New author: "
                                disabled={author.deleted}
                                options={authorlistQuery.data.authors}
                                placeholder="Author name"
                                defaultInputValue={author.name}
                                renderMenuItemChildren={(option, props) => (
                                  <>
                                    {/* eslint-disable-next-line react/prop-types */}
                                    <Highlighter search={props.text}>
                                      {option.name}
                                    </Highlighter>
                                    {option.aliasOf && (
                                      <em> → {option.aliasOf}</em>
                                    )}
                                  </>
                                )}
                                inputProps={{
                                  "data-lpignore": "true",
                                  className: author.deleted
                                    ? "strikethrough"
                                    : "",
                                }}
                                onChange={(selected) => {
                                  const newItem = {};
                                  if (selected && selected[0]) {
                                    newItem.deleted = false;
                                    if (selected[0].customOption) {
                                      newItem.name = selected[0].name;
                                      newItem.id = selected[0].id;
                                    } else {
                                      newItem.name =
                                        selected[0].aliasOf || selected[0].name;
                                      newItem.id = selected[0].id;
                                    }
                                  }

                                  helpers.replace(index, newItem);
                                }}
                              />
                              <ErrorMessage
                                name={`author.${index}.name`}
                                component="p"
                              />
                            </Col>
                            <Col sm>
                              <span>
                                <Button
                                  variant="link"
                                  className="text-reset"
                                  tabIndex={-1}
                                  onClick={() => {
                                    if (author.id === 0 && author.name === "") {
                                      helpers.remove(index);
                                    } else {
                                      helpers.replace(index, {
                                        ...author,
                                        deleted: !author.deleted,
                                      });
                                    }
                                  }}
                                >
                                  {author.deleted ? (
                                    <IconRestore
                                      size="1.5em"
                                      title="Restore this author"
                                    />
                                  ) : (
                                    <IconDelete
                                      size="1.5em"
                                      title="Delete this author"
                                    />
                                  )}
                                </Button>
                                {typeof author.id !== "string" ? (
                                  <LinkContainer to={`/authors/${author.id}`}>
                                    <Button
                                      variant="link"
                                      className="text-reset"
                                      tabIndex={-1}
                                    >
                                      <IconLink
                                        size="1.5em"
                                        title="Author info"
                                      />
                                    </Button>
                                  </LinkContainer>
                                ) : (
                                  ""
                                )}
                              </span>
                            </Col>
                          </Form.Group>
                        ))}
                        <Form.Row>
                          <Col>
                            <Button
                              onClick={() =>
                                helpers.push({
                                  name: "",
                                  id: `new-${newAuthorCounter++}`,
                                  deleted: false,
                                })
                              }
                            >
                              Add
                            </Button>
                          </Col>
                        </Form.Row>
                      </>
                    )}
                  </FieldArray>
                </Container>
              )}
            </Col>
          </Form.Group>
          <Form.Group as={Form.Row} controlId="type" className="mb-2">
            <Form.Label column sm={2} className="text-md-right text-sm-left">
              <strong>Type:</strong>
              <ErrorMessage name="type" component="p" />
            </Form.Label>
            <Col sm={10}>
              <Field
                as={Form.Control}
                component={ReferenceType}
                onBlur={handleBlur}
                name="type"
                placeholder="Type"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Form.Row} controlId="language" className="mb-2">
            <Form.Label column sm={2} className="text-md-right text-sm-left">
              <strong>Language:</strong>
              <ErrorMessage name="language" component="p" />
            </Form.Label>
            <Col sm={10}>
              <Field
                as={Form.Control}
                component={Language}
                onBlur={handleBlur}
                name="language"
                placeholder="Language"
              />
            </Col>
          </Form.Group>
          <Form.Group as={Form.Row} controlId="tags" className="mb-2">
            <Form.Label column sm={2} className="text-md-right text-sm-left">
              <strong>Tags:</strong>
              <ErrorMessage name="tags" component="p" />
            </Form.Label>
            <Col sm={10}>
              <Field
                as={Form.Control}
                component={TagEditor}
                onBlur={handleBlur}
                name="tags"
                placeholder="Tags"
              />
            </Col>
          </Form.Group>
          {reference.createdAt && (
            <Form.Group as={Form.Row} controlId="createdAt" className="mb-2">
              <Form.Label column sm={2} className="text-md-right text-sm-left">
                <strong>Created:</strong>
              </Form.Label>
              <Col sm={10}>
                <Field
                  as={Form.Control}
                  type="text"
                  name="createdAt"
                  tabIndex={-1}
                  readOnly
                  plaintext
                />
              </Col>
            </Form.Group>
          )}
          {reference.updatedAt && (
            <Form.Group as={Form.Row} controlId="updatedAt" className="mb-2">
              <Form.Label column sm={2} className="text-md-right text-sm-left">
                <strong>Updated:</strong>
              </Form.Label>
              <Col sm={10}>
                <Field
                  as={Form.Control}
                  type="text"
                  name="updatedAt"
                  tabIndex={-1}
                  readOnly
                  plaintext
                />
              </Col>
            </Form.Group>
          )}
          <Form.Group as={Form.Row} className="mt-3">
            <Col sm={{ span: 10, offset: 2 }}>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                Submit
              </Button>{" "}
              <Button type="reset" onClick={handleReset}>
                Reset
              </Button>
            </Col>
          </Form.Group>
        </Form>
      )}
    </Formik>
  );
};

ReferenceForm.propTypes = {
  reference: PropTypes.object.isRequired,
  submitHandler: PropTypes.func.isRequired,
  autoFocusRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

ReferenceForm.defaultProps = {
  autoFocusRef: createRef(null),
};

export default ReferenceForm;
