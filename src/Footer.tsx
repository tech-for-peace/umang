export default function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-sm text-[#6c7993] flex items-center justify-center gap-1.5">
        Made with{' '}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-heart h-3.5 w-3.5 text-umang-purple fill-umang-purple"
          aria-hidden="true"
        >
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        </svg>{' '}
        by techforpeace.co.in
      </p>
    </footer>
  );
}
