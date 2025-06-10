export const Button = ({ children, ...props }) => (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded" {...props}>
      {children}
    </button>
  );