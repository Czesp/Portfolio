import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return <main className="not-found"><span className="eyebrow">ERROR CODE / 404</span><h1>A small detour.</h1><p>This part of the portfolio hasn’t been assembled.</p><Link className="button button-lime" href="/">Back to the garage <ArrowUpRight size={18} /></Link></main>;
}
