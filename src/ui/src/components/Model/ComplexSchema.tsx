import { ContentSection } from "./ContentSection";


export const ComplexSchema = ({ complexSchema }) => {
  const type = complexSchema["@type"] ?? complexSchema.schema;
  const isEnum = type.includes("Enum");
  const isObject = type.includes("Object");
  const enumValues =
    complexSchema["dtmi:dtdl:property:enumValues;2"] ??
    complexSchema.enumValues ??
    [];
  const isMap = type.includes("Map");
  const mapKey =
    complexSchema["dtmi:dtdl:property:mapKey;2"] ?? complexSchema.mapKey ?? "";
  const mapValue =
    complexSchema["dtmi:dtdl:property:mapValue;2"] ??
    complexSchema.mapValue ??
    "";
  const displayName = typeof complexSchema.displayName === "object"? complexSchema.displayName.en : complexSchema.displayName;
  const description = typeof complexSchema.description === "object"? complexSchema.description.en : complexSchema.description;
  const comment = typeof complexSchema.comment === "object"? complexSchema.comment.en : complexSchema.comment;

  return (
    <div>
      <div>
        <span className=" leading-6 font-medium text-gray-900">{type}</span>
      </div>
      <div>
        <span className=" leading-6 font-light text-gray-900">
          {displayName}
        </span>
      </div>
      <div>
        <span className=" leading-6 font-light text-gray-900">
          {description}
        </span>
      </div>
      <div>
        <span className=" leading-6 font-light italic text-gray-900">
          {comment}
        </span>
      </div>
      {isEnum && enumValues && (
        <table className="w-full border m-4">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {enumValues.map((ev) => (
              <tr
                className=" hover:bg-slate-100 border-t cursor-default"
                title={ev.enumValue}
              >
                <td className="px-2 py-3 leading-6 font-medium text-gray-900">
                  {ev.name}
                </td>
                <td className="px-2 leading-6 font-medium text-gray-900">
                  {ev.enumValue}
                </td>
                <td className=" leading-6 font-light text-gray-900">
                  {ev.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isMap && mapKey && mapValue && (
        <>
          <div className="py-3">
            <span className=" leading-6 font-medium text-gray-900">Key</span>
            <span className=" leading-6 font-light px-2 text-gray-900">
              {mapKey.name}
            </span>
            <span className=" leading-6 font-light px-2 text-gray-900">
              {typeof mapKey.schema === "object" && (<ComplexSchema complexSchema={mapKey.schema} />)}
              {typeof mapKey.schema !== "object" && mapKey.schema}
            </span>
          </div>
          <div className="py-3">
            <span className=" leading-6 font-medium text-gray-900">Value</span>
            <span className=" leading-6 font-light px-2 text-gray-900">
              {mapValue.name}
            </span>
            <span className=" leading-6 font-light px-2 text-gray-900">
              {typeof mapValue.schema === "object" && (<ComplexSchema complexSchema={mapValue.schema} />)}
              {typeof mapValue.schema !== "object" && mapValue.schema}
            </span>
          </div>
        </>
      )}
       <div>
      {isObject && complexSchema.fields.length > 0 && ( <span className=" leading-6 font-medium text-gray-900">{}</span>) }
      </div>
      <div>
      {isObject && (<ContentSection title={`Fields`} contents={complexSchema.fields} onOpenModel={() =>{}} />) }
      </div>
    </div>
  );
};