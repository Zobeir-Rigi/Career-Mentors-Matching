import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link
      to={"/"}
      className="text-xl font-extrabold tracking-tight text-foreground"
    >
      <span className="text-fg">CYF</span>{" "}
      <span className="text-accent">Mentoring</span>
    </Link>
  );
}
