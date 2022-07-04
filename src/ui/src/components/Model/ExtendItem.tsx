export const ExtendItem = ({ item, onOpenModel }) => {
  return (
    <div
      className="flex flex-row cursor-pointer py-3"
      onClick={() => onOpenModel(item)}
    >
      {item}
    </div>
  );
};
