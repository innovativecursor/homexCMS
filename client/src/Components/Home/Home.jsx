import { Button, Table } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getAxiosCall } from "../../Axios/UniversalAxiosCalls";
import PageWrapper from "../PageContainer/PageWrapper";
function Home(props) {
  const columns = [
    {
      title: "User Id",
      dataIndex: "user_id",
      key: "user_id",
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Email Id",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Role Id",
      dataIndex: "role_id",
      key: "role_id",
    },
  ];
  const [results, setResults] = useState("");
  const navigateTo = useNavigate();
  const fetchRes = async () => {
    const res = await getAxiosCall("/users");

    setResults(res.data?.users);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-center my-8">
        <h1 className="text-2xl font-medium">
          Hi, {props.userDetails?.firstName}
          {"  "}
          {props.userDetails?.lastName}
        </h1>
      </div>
      <div className="flex justify-center items-center">
        <Button type="primary" onClick={fetchRes} className="text-black">
          Click to Check Users
        </Button>
      </div>
      <PageWrapper>
        <Table
          columns={columns}
          dataSource={results}
          size="large"
          style={{
            width: "100rem",
          }}

          // scroll={{
          //   x: 1500,
          //   y: 1000,
          // }}
        />
      </PageWrapper>
    </div>
  );
}
const mapDispatchToProps = (dispatch) => {
  return {
    loggedOut: () => dispatch({ type: "LOGGEDOUT" }),
  };
};
const mapStateToProps = (state) => {
  return {
    userDetails: state.universalReducer,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Home);
