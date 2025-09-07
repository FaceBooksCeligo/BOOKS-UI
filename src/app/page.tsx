import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function HomePage() {
  const token = cookies().get("books_ui_token")?.value;
  if (!token) redirect("/auth/login");
  redirect("/dashboard");
}
