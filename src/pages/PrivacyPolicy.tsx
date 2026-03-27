import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scanner
          </Link>
        </Button>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-10">Last updated: March 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Introduction</h2>
            <p>
              This Privacy Policy explains how Creative Hauz ("we," "us," or "our") collects, uses,
              and protects your information when you use the free Automation Scanner tool hosted at
              this website. Creative Hauz is an AI automation agency founded by Linda Kisimisi.
              Learn more at{" "}
              <a
                href="https://creativehauz.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                creativehauz.space
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Personal information</strong> — your name and email address, provided
                voluntarily when you request your report.
              </li>
              <li>
                <strong>Business details</strong> — your industry, role, pain points, and
                time-consuming tasks shared through the questionnaire.
              </li>
              <li>
                <strong>Usage data</strong> — pages visited and interactions for basic analytics
                and tool improvement.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Generate your personalized automation report.</li>
              <li>Send the report and PDF to your email if requested.</li>
              <li>Improve the scanner tool and user experience.</li>
              <li>Contact you about AI automation services from Creative Hauz.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">AI Processing</h2>
            <p>
              Your questionnaire responses may be analyzed using AI to generate tailored
              recommendations. We do not use your personal data to train AI models.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Data Sharing</h2>
            <p>
              We do not sell your data. We may share it with trusted service providers (e.g., email
              delivery, cloud hosting, PDF generation) under strict data-handling agreements solely
              to operate this tool.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Data Storage &amp; Security</h2>
            <p>
              Your data is stored securely in our cloud database with encryption at rest and in
              transit. We retain lead information for marketing purposes unless you unsubscribe or
              request deletion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Your Rights</h2>
            <p>
              You can request to view, correct, or delete your personal data at any time by
              contacting us. If you've received emails from us, you can unsubscribe using the link
              in any email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Cookies</h2>
            <p>
              We use minimal cookies for functionality and basic analytics. No third-party
              advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Children's Privacy</h2>
            <p>
              This tool is designed for business owners and professionals. It is not intended for
              use by children under the age of 18.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The latest version will always be
              available on this page with the updated date above.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
            <p>
              If you have questions about this policy or your data, please contact:
            </p>
            <p className="font-medium">
              Linda Kisimisi, Creative Hauz
              <br />
              <a href="mailto:info@creativehauz.space" className="text-primary hover:underline">
                info@creativehauz.space
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
