import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { useQuery } from "react-query";
import Dropdown from "react-bootstrap/Dropdown";
import ScaleLoader from "react-spinners/ScaleLoader";

import apiEndpoint from "../utils/api-endpoint";

const count = 10;
const params = [`limit=${count}`, "order=refcount,desc"];
const url = `${apiEndpoint}/api/tags/withRefCount?${params.join("&")}`;

const TopTags = () => {
  const { isLoading, error, data } = useQuery("top tags", () => {
    return fetch(url).then((res) => res.json());
  });

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

  return (
    <>
      <div className="mb-2">
        <em>Top tags by usage:</em>
      </div>
      <Dropdown>
        <Dropdown.Toggle style={{ width: "100%" }} id="top-tags-dropdown">
          Select tag to view
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {data.tags.map((tag) => (
            <LinkContainer key={tag.id} to={`/tags/${tag.id}`}>
              <Dropdown.Item>
                {tag.name} <em>({tag.refcount})</em>
              </Dropdown.Item>
            </LinkContainer>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default TopTags;
