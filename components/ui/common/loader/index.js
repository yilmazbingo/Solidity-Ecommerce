const SIZES = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export default function Loader({ size = "md" }) {
  return (
    //  https://tobiasahlin.com/spinkit/
    <div className={`sk-fading-circle ${SIZES[size]} `}>
      {/* when we create array from Array.from all the items are undefined */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={`dot-${i}`} className={`sk-circle${i + 1} sk-circle `} />
      ))}
    </div>
  );
}
