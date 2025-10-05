import { Github, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background dark:bg-background-dark border-t border-secondary/50 dark:border-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm opacity-80">
            © {new Date().getFullYear()} AramAI. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="button-styled !w-auto px-4 py-2 rounded-xl"
            >
              Join the waitlist
            </button>
            <a
              href="mailto:hello@example.com"
              className="thin-button !w-auto rounded-xl"
            >
              <Mail className="w-4 h-4 mr-1" />
              Contact
            </a>
            <a
              href="#"
              className="thin-button !w-auto rounded-xl"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
