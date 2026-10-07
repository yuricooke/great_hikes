import LoginModal from "@/components/Auth/LoginModal";

/** In-app navigation to /login opens the sign-in pop-up over the current page. */
export default function InterceptedLogin() {
  return <LoginModal />;
}
