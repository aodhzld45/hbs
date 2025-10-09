import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import DynamicSelectBox from "../../components/Common/DynamicSelectBox";
import { fetchUserMenuDeployCheck } from '../../services/Admin/userMenuApi';



const TestPage = () => {
  // DynamicSelectBox 선택값
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);
  const [selected3, setSelected3] = useState<string | null>(null);

  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

    const onClick = async () => {
    setLoading(true);
    try {
      const data = await fetchUserMenuDeployCheck();
      setResp(data);
      console.log('배포 체크 응답:', data);
      alert(`배포 OK: ${data?.status} @ ${data?.time}`);
    } catch (e) {
      console.error('배포 체크 실패:', e);
      alert('배포 체크 실패(콘솔 확인)');
    } finally {
      setLoading(false);
    }
  };


  // payload 객체
  const payload = {
    "첫번째 셀렉트 박스": selected1 || '',
    "두번째 셀렉트 박스": selected2 || '',
    "세번째 셀렉트 박스": selected3 || ''
  };

  useEffect(() => {
    console.log("현재 payload:", payload);
  }, [selected1, selected2, selected3]);

  /** FormData 생성 함수 */
  const createFormData = () => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  };

  return (
    <Layout>
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">DynamicSelectBox 테스트</h1>
        <pre>
          예시 group은 NATION입니다.
        </pre>

        {/* Dynamic SelectBox */}
        <DynamicSelectBox
          group="NATION"
          levels={[
            {
              label: "첫번째 - 산업 분류 선택",
              value: selected1,
              setValue: setSelected1,
              placeholder: "1차 산업분류를 선택해주세요",
              labelClassName: "text-blue-600 font-bold mb-2",
              selectClassName: "border border-blue-500 p-3 rounded",
            },
            {
              label: "두번째 - 산업 분류 선택",
              value: selected2,
              setValue: setSelected2,
              placeholder: "2차 산업분류를 선택해주세요.",
              labelClassName: "text-blue-600 font-bold mb-2",
              selectClassName: "border border-green-500 p-3 rounded",
            },
            {
              label: "세번째 - 산업 분류 선택",
              value: selected3,
              setValue: setSelected3,
              placeholder: "3차 산업 분류를 선택해주세요.",
              labelClassName: "text-blue-600 font-bold mb-2",
              selectClassName: "border border-red-500 p-3 rounded",
            }
          ]}
        />

        <button onClick={onClick} disabled={loading}>
          {loading ? '확인 중...' : '배포 체크'}
        </button>

        {/* payload 확인용 출력 */}
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Payload 결과</h2>
          <pre className="text-sm text-gray-700">{JSON.stringify(payload, null, 2)}</pre>
        </div>

        {/* FormData 생성 버튼 */}
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            const formData = createFormData();

            // FormData 콘솔 출력
            Array.from(formData.entries()).forEach(([key, value]) => {
              console.log("key : ",key, " - ", "실질 값 :", value);
            });
          }}
        >
          FormData 생성하기
        </button>
      </div>
    </Layout>
  );
};

export default TestPage;
