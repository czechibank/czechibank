import SignInPage from "@/app/signin/page";
import { Toaster } from "@/components/ui/toaster";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { http, HttpResponse } from "msw";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const noSessionHandler = http.get("*/api/auth/get-session", () => HttpResponse.json({ session: null, user: null }));

const invalidLoginHandler = http.post("*/api/auth/sign-in/email", () =>
  HttpResponse.json(
    {
      error: {
        message: "Invalid email or password",
        code: "INVALID_EMAIL_OR_PASSWORD",
        status: 401,
        statusCode: 401,
      },
    },
    { status: 401 },
  ),
);

async function fillAndSubmit(
  canvas: ReturnType<typeof within>,
  { email, password }: { email?: string; password?: string },
) {
  if (email) await userEvent.type(canvas.getByLabelText(/email/i), email);
  if (password) await userEvent.type(canvas.getByLabelText(/password/i), password);
  await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
}

const meta: Meta<typeof SignInPage> = {
  title: "Auth/SignIn",
  component: SignInPage,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-md p-8">
        <Story />
        <Toaster />
      </div>
    ),
  ],
  parameters: {
    msw: {
      handlers: [noSessionHandler],
    },
    nextjs: {
      navigation: {
        pathname: "/signin",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SignInPage>;

export const Default: Story = {};

export const FormValidation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillAndSubmit(canvas, {});

    await waitFor(() => {
      expect(canvas.getByText(/invalid email/i)).toBeVisible();
    });
  },
};

export const PasswordTooShort: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillAndSubmit(canvas, { email: "test@example.com", password: "short" });

    await waitFor(() => {
      // Query by id to avoid matching the description text that also contains the length
      expect(
        canvas.getByText(new RegExp(`password must be at least ${MIN_PASSWORD_LENGTH} characters long`, "i"), {
          selector: "#password-message",
        }),
      ).toBeVisible();
    });
  },
};

export const InvalidCredentials: Story = {
  parameters: {
    msw: {
      handlers: [noSessionHandler, invalidLoginHandler],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillAndSubmit(canvas, { email: "test@example.com", password: "wrongpassword123" });

    // Toast renders via a portal outside the story canvas, so we use screen instead of canvas
    await waitFor(
      () => {
        expect(screen.getByRole("status")).toBeVisible();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(canvas.getByLabelText(/password/i)).toHaveValue("");
      },
      { timeout: 2000 },
    );
  },
};
