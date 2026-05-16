export default function Footer() {
  return (
    <footer className="border-t bg-gray-900 py-12 text-gray-400">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          <div>
            <div className="text-lg font-bold text-white">ShieldAI</div>
            <p className="mt-2 text-sm">India&apos;s first LLM safety platform. Protecting AI applications from prompt injection, jailbreaks, and data leaks.</p>
          </div>
          <div>
            <div className="font-semibold text-white">Product</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>API</li>
              <li>Dashboard</li>
              <li>NPM Package</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white">Resources</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Documentation</li>
              <li>Blog</li>
              <li>Changelog</li>
              <li>Status</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white">Company</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs">
          © {new Date().getFullYear()} ShieldAI. Made with 🇮🇳 in India.
        </div>
      </div>
    </footer>
  );
}
