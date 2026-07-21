import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="text-center my-20">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        404 - Page Not Found
      </h1>
      <p className="my-4 text-lg text-zinc-600">
        The page you are looking for does not exist. Please check the URL or go
        back to the homepage.
      </p>
      <Link to={"/"}>Go back to the homepage</Link>
    </div>
  );
};

export default NotFound;
