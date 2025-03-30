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

function App() {
  return (
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
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
