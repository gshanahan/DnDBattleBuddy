export const Card = ({ children, ...props }) => (
    <div className="bg-white p-4 rounded shadow" {...props}>
      {children}
    </div>
  );