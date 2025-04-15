import { Route, Switch } from "wouter";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import FeatureDetailPage from "@/pages/FeatureDetailPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import SuccessPage from "@/pages/SuccessPage";
import NotFound from "@/pages/not-found";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/checkout/:plan" component={CheckoutPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password/:token" component={ResetPasswordPage} />
        <Route path="/features/:featureId" component={FeatureDetailPage} />
        <Route path="/verify-email/:token" component={VerifyEmailPage} />
        <Route path="/success" component={SuccessPage} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

export default App;
