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
  const type = complexSchema["@type"];
  const isEnum = type.includes("Enum");
  const enumValues = complexSchema["dtmi:dtdl:property:enumValues;2"];
  console.log(enumValues);
  return (
    <div>
      <div>
        <span className=" leading-6 font-medium text-gray-900">{type}</span>
      </div>
      {isEnum &&
        enumValues &&
        enumValues.map((ev) => (
          <div>
            <span className=" leading-6 font-light text-gray-900">
              {ev.name} ={" "}
            </span>
            <span className=" leading-6 font-medium text-gray-900">
              {ev.enumValue}
            </span>
          </div>
        ))}
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
      {content["@type"] !== "Component" && content.schema && (
        <Kvp
          keyName={"Schema"}
          value={content.schema}
          className="flex flex-row"
        />
      )}
      {content["dtmi:dtdl:property:schema;2"] && (
        <ComplexSchema complexSchema={content["dtmi:dtdl:property:schema;2"]} />
      )}
      {content.target && (
        <Kvp
          keyName={"Targets"}
          value={content.target}
          className="flex flex-row"
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
      {extenders && extenders.map((extend) => (
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

    console.log(model.contents);

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
