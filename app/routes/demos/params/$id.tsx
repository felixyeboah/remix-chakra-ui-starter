import { useCatch, json, useLoaderData } from "remix";
import type { LoaderFunction, MetaFunction } from "remix";
import { Text, Divider } from "@chakra-ui/react";

// The `$` in route filenames becomes a pattern that's parsed from the URL and
// passed to your loaders so you can look up data.
// - https://remix.run/api/conventions#loader-params
export let loader: LoaderFunction = async ({ params }) => {
  // pretend like we're using params.id to look something up in the db

  if (params.id === "this-record-does-not-exist") {
    // If the record doesn't exist we can't render the route normally, so
    // instead we throw a 404 reponse to stop running code here and show the
    // user the catch boundary.
    throw new Response("Not Found", { status: 404 });
  }

  // now pretend like the record exists but the user just isn't authorized to
  // see it.
  if (params.id === "shh-its-a-secret") {
    // Again, we can't render the component if the user isn't authorized. You
    // can even put data in the response that might help the user rectify the
    // issue! Like emailing the webmaster for access to the page. (Oh, right,
    // `json` is just a Response helper that makes it easier to send JSON
    // responses).
    throw json({ webmasterEmail: "hello@remix.run" }, { status: 401 });
  }

  // Sometimes your code just blows up and you never anticipated it. Remix will
  // automatically catch it and send the UI to the error boundary.
  if (params.id === "kaboom") {
    lol();
  }

  // but otherwise the record was found, user has access, so we can do whatever
  // else we needed to in the loader and return the data. (This is boring, we're
  // just gonna return the params.id).
  return { param: params.id };
};

export default function ParamDemo() {
  let data = useLoaderData();
  return (
    <Text as="h1">
      The param is <i style={{ color: "red" }}>{data.param}</i>
    </Text>
  );
}

// https://remix.run/api/conventions#catchboundary
// https://remix.run/api/remix#usecatch
// https://remix.run/api/guides/not-found
export function CatchBoundary() {
  let caught = useCatch();

  let message: React.ReactNode;
  switch (caught.status) {
    case 401:
      message = (
        <Text as="p">
          Looks like you tried to visit a page that you do not have access to.
          Maybe ask the webmaster ({caught.data.webmasterEmail}) for access.
        </Text>
      );
    case 404:
      message = (
        <Text as="p">Looks like you tried to visit a page that does not exist.</Text>
      );
    default:
      message = (
        <Text as="p">
          There was a problem with your request!
          <Divider />
          {caught.status} {caught.statusText}
        </Text>
      );
  }

  return (
    <>
      <Text as="h2">Oops!</Text>
      <Text as="p">{message}</Text>
      <Text as="p">
        (Isn't it cool that the user gets to stay in context and try a different
        link in the parts of the UI that didn't blow up?)
      </Text>
    </>
  );
}

// https://remix.run/api/conventions#errorboundary
// https://remix.run/api/guides/not-found
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <>
      <Text as="h2">Error!</Text>
      <Text as="p">{error.message}</Text>
      <Text as="p">
        (Isn't it cool that the user gets to stay in context and try a different
        link in the parts of the UI that didn't blow up?)
      </Text>
    </>
  );
}

export let meta: MetaFunction = ({ data }) => {
  return {
    title: data ? `Param: ${data.param}` : "Oops...",
  };
};
