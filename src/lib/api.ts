import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  console.error(error);
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const field = issue?.path.join(" ");
    const message = issue
      ? `${field ? `${field}: ` : ""}${issue.message}`
      : "Please check the form and try again.";
    return NextResponse.json(
      { error: message, details: error.flatten() },
      { status: 400 },
    );
  }
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    (error as { code: number }).code === 11000
  )
    return NextResponse.json(
      { error: "A record with this name or slug already exists." },
      { status: 409 },
    );
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
