import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GlobalForm from "../GlobalForm/GlobalForm";

function DeleteProjects() {
  const location = useLocation();
  const [record, setRecord] = useState(location.state);
  useEffect(() => {
    if (location?.state) {
      "Location state", location.state;
      let asd = { ...location.state };
      setRecord(asd);
      "record==>", record;
    }
  }, [location]);

  return (
    <>
      {record ? (
        <GlobalForm pageMode="Delete" record={record} type="Projects" />
      ) : null}
    </>
  );
}

export default DeleteProjects;
