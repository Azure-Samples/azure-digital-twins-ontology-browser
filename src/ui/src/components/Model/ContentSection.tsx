import { useState } from "react";
import { ContentElement } from "./ContentElement";


export const ContentSection = ({ title, contents, onOpenModel }) => {
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