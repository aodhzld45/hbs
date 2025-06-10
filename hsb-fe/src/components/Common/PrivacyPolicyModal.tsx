// components/Common/PrivacyPolicyModal.tsx
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">개인정보 수집 및 이용동의</h2>
          <button onClick={onClose} className="text-xl font-bold">&times;</button>
        </div>

        <div className="text-sm text-gray-700 space-y-6 leading-relaxed">
            <section>
                <h4 className="font-semibold text-base mb-1">1. 수집하는 정보와 방법</h4>
                <p className="pl-2">• 수집 항목: 회사명, 이름, 이메일, 전화번호</p>
                <p className="pl-2">• 수집 방식: 문의 양식을 통한 자발적 입력</p>
            </section>

            <section>
                <h4 className="font-semibold text-base mb-1">2. 정보 활용 목적</h4>
                <p className="pl-2">
                • 여러분의 소중한 제안이나 협업 요청에 빠르고 정확하게 응답하기 위함입니다.
                </p>
            </section>

            <section>
                <h4 className="font-semibold text-base mb-1">3. 보관 및 삭제 방침</h4>
                <p className="pl-2">• 입력하신 정보는 문의일로부터 최대 3년간 보관 후 자동 파기됩니다.</p>
                <p className="text-gray-400 text-xs text-right w-full">시행일: 2025.06.10</p>
            </section>
            </div>
            
        <div className="mt-6 text-center">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">확인</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
