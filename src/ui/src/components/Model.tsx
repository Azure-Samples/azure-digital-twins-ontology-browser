import { Pivot, PivotItem, Stack, StackItem } from "@fluentui/react";
import { ChromeCloseIcon } from "@fluentui/react-icons-mdl2";
import { useEffect, useState } from "react";
import { isArray } from "util";
import { Kvp } from "./Kvp";

export interface IModelProps {
  model: any;
  className?: string;
}

const ComplexSchema = ({ complexSchema }) => {
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

const ContentElement = ({ content, onOpenModel }) => {
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

const ContentSection = ({ title, contents, onOpenModel }) => {
  // eslint-disable-next-line
  const [items, setItems] = useState(contents ?? []);
  return (
    <>
      {items.length > 0 && (
        <div className="w-full  -mx-8 py-3 sm:px-6 border-b">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            {items.length} {title}
          </h2>
        </div>
      )}
      {items.map((content) => (
        <ContentElement
          content={content}
          key={content.name}
          onOpenModel={onOpenModel}
        />
      ))}
    </>
  );
};

const ExtendItem = ({ item, onOpenModel }) => {
  return (
    <div
      className="flex flex-row cursor-pointer py-3"
      onClick={() => onOpenModel(item)}
    >
      {item}
    </div>
  );
};

const ExtendsSection = ({ model, onOpenModel }) => {
  const extenders =
    model.extends && isArray(model.extends)
      ? model.extends
      : model.extends
      ? [model.extends]
      : [];

  return (
    <>
      {model.extends && (
        <div className="w-full  -mx-8 py-3 sm:px-6 border-b">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Extends
          </h2>
        </div>
      )}
      {extenders &&
        extenders.map((extend) => (
          <ExtendItem item={extend} onOpenModel={onOpenModel} />
        ))}
    </>
  );
};

export const Model: React.FC<any> = ({
  model,
  className,
  onModelClose,
  onOpenModel,
}) => {
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [modelComment, setModelComment] = useState("");
  const [properties, setProperties] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [commands, setCommands] = useState([]);
  const [components, setComponents] = useState([]);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    let name =
      model.displayName && typeof model.displayName === "object"
        ? model.displayName.en
        : model.displayName;

    if (name === undefined) name = model["@id"];

    setModelDescription(
      model.description && typeof model.description === "object"
        ? model.description.en
        : model.description
    );
    setModelName(name);
    setModelComment(
      model.comment && typeof model.comment === "object"
        ? model.comment.en
        : model.comment
    );

    setProperties(
      model.contents?.filter((c) => c["@type"] === "Property") ?? []
    );
    setTelemetry(
      model.contents?.filter((c) => c["@type"] === "Telemetry") ?? []
    );
    setCommands(model.contents?.filter((c) => c["@type"] === "Command") ?? []);
    setComponents(
      model.contents?.filter((c) => c["@type"] === "Component") ?? []
    );
    setRelationships(
      model.contents?.filter((c) => c["@type"] === "Relationship") ?? []
    );
  }, [
    model,
    modelName,
    setCommands,
    setProperties,
    setComponents,
    setRelationships,
    setTelemetry,
  ]);

  return (
    <div className={"ontology-panel border-l " + className}>
      {model && (
        <>
          <div className="px-10 py-5 sm:px-6 flex flex-row border-b">
            <div className="basis-auto h-20 w-full">
              <Stack aria-orientation="vertical">
                <StackItem className="mt-4 w-100">
                  <h2
                    className="text-lg leading-6 font-medium text-gray-900 float-left"
                    title={model["@id"]}
                  >
                    {modelName}
                  </h2>
                  <span
                    className="float-right text-lg leading-6 font-medium text-gray-400 cursor-pointer"
                    title={`Close ${modelName}`}
                  >
                    <ChromeCloseIcon onClick={() => onModelClose()} />
                  </span>
                </StackItem>
                <StackItem>{modelDescription}</StackItem>
                <StackItem>{modelComment}</StackItem>
              </Stack>
            </div>
          </div>
          <Pivot className="bg-white shadow overflow-hidden sm:rounded-lg ">
            <PivotItem headerText={"Details"}>
              <div className="flex flex-col overflow-scroll">
                <div className="overflow-auto max-h-screen">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {model["@id"]}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 p-5 overflow-auto max-h-screen">
                    {properties && properties.length > 0 && (
                      <ContentSection
                        title="Properties"
                        contents={properties}
                        onOpenModel={onOpenModel}
                      />
                    )}
                    {telemetry && telemetry.length > 0 && (
                      <ContentSection
                        title="Telemetry"
                        contents={telemetry}
                        onOpenModel={onOpenModel}
                      />
                    )}
                    {relationships && relationships.length > 0 && (
                      <ContentSection
                        title="Relationships"
                        contents={relationships}
                        onOpenModel={onOpenModel}
                      />
                    )}
                    {components && components.length > 0 && (
                      <ContentSection
                        title="Components"
                        contents={components}
                        onOpenModel={onOpenModel}
                      />
                    )}
                    {commands && commands.length > 0 && (
                      <ContentSection
                        title="Commands"
                        contents={commands}
                        onOpenModel={onOpenModel}
                      />
                    )}
                    {model.extends && (
                      <ExtendsSection model={model} onOpenModel={onOpenModel} />
                    )}
                  </div>
                </div>
              </div>
            </PivotItem>
            <PivotItem headerText="DTDL">
              <div className="flex flex-col">
                <div className="bg-white overflow-scroll mx-6 pt-4">
                  <div className="border shadow border-gray-200 p-5 overflow-auto max-h-screen">
                    <pre>{JSON.stringify(model, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </PivotItem>
          </Pivot>
        </>
      )}
    </div>
  );
};
