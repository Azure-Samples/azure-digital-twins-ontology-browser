import { isArray } from "util";


export const Kvp: React.FC<any> = ({ className, keyName, value }) => {
  if (!className) className = "text-sm font-medium text-gray-500";

  if (typeof value == "object" && !isArray(value)) {
    return (
      <div className={className}>
        {Object.keys(value).map((k: string) => (
          <Kvp keyName={keyName + " " + k} value={value[k]} />
        ))}
      </div>
    );
  } else if (typeof value === "object" && isArray(value)) {
    return (
      <div className={className}>
        <div className="basis-1/4 text-sm font-medium text-gray-800">
          {keyName}
        </div>
        <div className="basis-3/4 text-sm font-medium text-gray-500">
          {value.map((v: any, i: number) => (
            <Kvp keyName={keyName + i} key={keyName + v} value={v} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="basis-1/4 text-sm font-medium text-gray-800">
        {keyName}
      </div>
      <div className="basis-3/4 text-sm font-medium text-gray-500">{value}</div>
    </div>
  );
};