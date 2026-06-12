function Footer() {
  return (
    <footer className="bg-blue-950 border-t border-blue-800 py-8 text-center">
      <p className="text-white font-semibold tracking-tight">
        SecureExam{" "}
        <span className="text-amber-400">
          AI
        </span>
      </p>
      <p className="mt-2 text-blue-300 text-sm">
        &copy; {new Date().getFullYear()} SecureExam AI. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;