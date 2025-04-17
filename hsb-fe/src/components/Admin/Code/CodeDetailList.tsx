import React, { useEffect, useState } from 'react';
import { fetchCodeDetails } from '../../../services/Common/CodeApi';
import { CodeDetail } from '../../../types/Common/CodeDetail';

interface Props {
  pcode: string;
  onClose: () => void;
}

const CodeDetailList: React.FC<Props> = ({ pcode, onClose }) => {
  const [details, setDetails] = useState<CodeDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCodeDetails(pcode);
        setDetails(data);
      } catch {
        setError('하위 코드 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [pcode]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white w-11/12 max-w-2xl rounded shadow-lg overflow-auto max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{pcode} 하위 코드 목록</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4">
          {loading ? (
            <div>로딩 중...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : details.length === 0 ? (
            <div className="text-gray-600">등록된 하위 코드가 없습니다.</div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1">No</th>
                  <th className="border px-2 py-1">코드</th>
                  <th className="border px-2 py-1">코드명</th>
                  <th className="border px-2 py-1">추가정보</th>
                  <th className="border px-2 py-1">순번</th>
                </tr>
              </thead>
              <tbody>
                {details.map(d => (
                  <tr key={d.dcodeNo}>
                    <td className="border px-2 py-1 text-center">{d.dcodeNo}</td>
                    <td className="border px-2 py-1">{d.dcode}</td>
                    <td className="border px-2 py-1">{d.dcodeNm}</td>
                    <td className="border px-2 py-1">{d.dcodeExt}</td>
                    <td className="border px-2 py-1 text-center">{d.dcodeSeqNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeDetailList;
