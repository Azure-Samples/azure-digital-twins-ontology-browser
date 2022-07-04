import { Kvp } from "../Common/Kvp";
import { ComplexSchema } from "./ComplexSchema";

export const ContentElement = ({ content, onOpenModel }) => {
  const contentDisplayName =
    content.displayName && typeof content.displayName === "object"
      ? content.displayName.en
      : content.displayName;
  const contentDescription =
    content.description && typeof content.description === "object"
      ? content.description.en
      : content.description;
  const contentComment =
    content.comment && typeof content.comment === "object"
      ? content.comment.en
      : content.comment;

  return (
    <div className="mx-6 py-3 border-b">
      <div>
        <span className=" leading-6 font-medium text-gray-900">
          {content.name}
        </span>
        <span className=" ml-2">{contentDisplayName}</span>
      </div>
      <div className="flex flex-row">{contentDescription}</div>
      <div className="px-6 py-3 italic">{contentComment}</div>
      {content["@type"] !== "Component" &&
        content.schema &&
        typeof content.schema === "object" && (
          <ComplexSchema complexSchema={content.schema} />
        )}
      {content["dtmi:dtdl:property:schema;2"] && (
        <ComplexSchema complexSchema={content["dtmi:dtdl:property:schema;2"]} />
      )}
      {content.target && (
        <Kvp
          keyName={"Targets"}
          value={content.target}
          className="flex flex-row cursor-pointer"
          onClick={() => onOpenModel(content.target)}
        />
      )}
      {content["@type"] === "Component" && (
        <div
          className="flex flex-row cursor-pointer"
          onClick={() => onOpenModel(content.schema)}
        >
          {content.schema}
        </div>
      )}
    </div>
  );
};

