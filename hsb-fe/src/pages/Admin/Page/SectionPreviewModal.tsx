import React from "react";
import { Dialog } from "@headlessui/react";
import { PageSectionItem } from "../../../types/Admin/PageSectionItem";
import DynamicSection from "./DynamicSection";
 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  section: PageSectionItem;
}

const SectionPreviewModal: React.FC<Props> = ({ isOpen, onClose, section }) => {
  const optionJson =
    typeof section.optionJson === "string"
      ? JSON.parse(section.optionJson)
      : section.optionJson;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-5xl rounded bg-white p-6 shadow-xl overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              🔍 섹션 미리보기: {section.sectionName}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black text-xl font-bold">
              ×
            </button>
          </div>

          <DynamicSection layoutType={section.layoutType} optionJson={optionJson} />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SectionPreviewModal;
