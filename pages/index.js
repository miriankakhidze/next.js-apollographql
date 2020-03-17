import Layout from "../components/Layout";

import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

export default function Index() {
  const { loading, error, data } = useQuery(
    gql`
      query {
        users {
          id
          name
          lastname
        }
      }
    `
  );

  return (
    <Layout>
      <p>Hello Next.js with apollographql</p>
      <ul>
        {data &&
          data.nodes.map(item => (
            <li key={item.id}>
              {item.name}-{item.lastname}
            </li>
          ))}
      </ul>
    </Layout>
  );
}
