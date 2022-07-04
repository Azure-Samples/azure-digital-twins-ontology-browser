import { isArray } from "util";
import { ExtendItem } from "./ExtendItem";

export const ExtendsSection = ({ model, onOpenModel }) => {
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