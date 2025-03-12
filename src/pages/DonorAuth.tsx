import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useFirebaseAuth } from "../context/FirebaseAuthContext";
import DonorLoginForm from "../components/auth/DonorLoginForm";
import DonorRegistrationForm from "../components/auth/DonorRegistrationForm";
import { Alert, AlertTitle } from "@mui/material";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DonorAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, error, login, register, clearError } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/donor-dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: any) => {
    console.log("Login attempt with:", data.email);
    clearError();
    setLocalError(null);
    setIsLoading(true);
    try {
      console.log("Calling login function with role DONOR");
      await login(data.email, data.password, "DONOR");
      console.log("Login function completed");
      // The login function updates the auth state, which will trigger the useEffect above
      // to redirect to the dashboard if successful
    } catch (err: any) {
      console.error("Login error:", err);
      setLocalError(err.message || "Login failed. Please check your credentials.");
      // Error is handled by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    console.log("Registration attempt with:", data.email);
    clearError();
    setLocalError(null);
    setIsLoading(true);
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: "donor",
        preferences: {
          interests: data.interests,
          preferredCommunication: data.preferredCommunication
        }
      };
      
      console.log("Calling register function with userData:", userData);
      await register(data.email, data.password, userData);
      console.log("Registration function completed");
      setActiveTab("login");
    } catch (err: any) {
      console.error("Registration error:", err);
      setLocalError(err.message || "Registration failed. Please try again.");
      // Error is handled by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="w-full max-w-sm mx-auto lg:w-96">
              <div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Donor Portal</h2>
                <p className="mt-2 text-sm text-gray-600">
                  {activeTab === "login" 
                    ? "Sign in to your account to make donations and track your impact." 
                    : "Create an account to start making a difference today."}
                </p>
              </div>

              <div className="mt-8">
                {(error || localError) && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    <AlertTitle>Error</AlertTitle>
                    {error || localError}
                  </Alert>
                )}

                <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <DonorLoginForm onSubmit={handleLogin} isLoading={isLoading} />
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <DonorRegistrationForm onSubmit={handleRegister} isLoading={isLoading} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          <div className="relative flex-1 hidden w-0 lg:block">
            <div className="absolute inset-0 bg-rose-600">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-800 opacity-90"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
                <h2 className="text-4xl font-bold mb-4">Make a Difference Today</h2>
                <p className="text-xl max-w-lg text-center">
                  Your donations help us provide essential services to communities in need.
                  Join our mission to create lasting positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonorAuth;