import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

export const getServerSideProps = (async (sv) => {
  return { props: { code: (sv.query.code || "").toString() } };
}) satisfies GetServerSideProps<{ code: string }>;

export default function Callback({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [isRes, setIsRes] = useState(false);
  const [resData, setResData] = useState({
    s: true,
    msg: "",
  });

  return (
    <>
      {isRes === false ? (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>Please Verify to join server</h2>
          <HCaptcha
            sitekey="d4b6e5c0-09aa-48ca-adcc-165835a6726a"
            onVerify={(token, ekey) => {
              console.log(token, ekey);
              fetch("/api/submit", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token,
                  ekey,
                  code,
                }),
              }).then((res) => {
                res.json().then((data) => {
                  console.log(data);
                  setResData(data);
                  setIsRes(true);
                });
              });
            }}
          />
        </div>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>{resData.s ? "Joined" : "Error"}</h2>
        </div>
      )}
    </>
  );
}
