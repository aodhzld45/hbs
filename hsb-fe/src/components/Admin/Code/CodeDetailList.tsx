// src/components/Admin/Code/CodeDetailList.tsx
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import {
  fetchCodeDetails,
  createCodeDetail,
  updateCodeDetail,
  deleteCodeDetail,
} from '../../../services/Common/CodeApi'
import { CodeDetail } from '../../../types/Common/CodeDetail'

interface Props {
  pcode: string
  onClose: () => void
}

interface DetailForm {
  dcode: string
  dcodeNm: string
  dcodeExt?: string
  dcodeSeqNo: number
  
}

const CodeDetailList: React.FC<Props> = ({ pcode, onClose }) => {
  const [details, setDetails] = useState<CodeDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newDetail, setNewDetail] = useState<DetailForm>({
    dcode: '',
    dcodeNm: '',
    dcodeExt: '',
    dcodeSeqNo: 1,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDetail, setEditingDetail] = useState<DetailForm>({
    dcode: '',
    dcodeNm: '',
    dcodeExt: '',
    dcodeSeqNo: 1,
  })

  // 1) 목록 불러오기
  useEffect(() => {
    loadDetails()
  }, [pcode])

  async function loadDetails() {
    setLoading(true)
    try {
      const list = await fetchCodeDetails(pcode)
      setDetails(list)
    } catch {
      setError('하위 코드 목록을 불러오는 데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 2) 신규 등록폼 변경
  const handleNewChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDetail(prev => ({
      ...prev,
      [name]: name === 'dcodeSeqNo' ? Number(value) : value,
    }))
  }

  // 3) 등록
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createCodeDetail(pcode, newDetail)
      setNewDetail({ dcode: '', dcodeNm: '', dcodeExt: '', dcodeSeqNo: 1 })
      await loadDetails()
    } catch {
      setError('하위 코드 등록에 실패했습니다.')
    }
  }

  // 4) 수정 모드 진입
  const startEdit = (d: CodeDetail) => {
    setEditingId(d.dcodeNo)
    setEditingDetail({
      dcode: d.dcode,
      dcodeNm: d.dcodeNm,
      dcodeExt: d.dcodeExt || '',
      dcodeSeqNo: d.dcodeSeqNo,
    })
  }

  // 5) 수정폼 변경
  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditingDetail(prev => ({
      ...prev,
      [name]: name === 'dcodeSeqNo' ? Number(value) : value,
    }))
  }

  // 6) 저장
 const handleUpdate = async () => {
        if (editingId == null) return
        try {
          await updateCodeDetail(pcode, editingId, {
            ...editingDetail,
            useTf: 'Y',
            delTf: 'N',
          })
          setEditingId(null)
          await loadDetails()
        } catch {
          setError('하위 코드 수정에 실패했습니다.')
        }
      }

  // 7) 삭제
  const handleDelete = async (dcodeNo: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await deleteCodeDetail(pcode, dcodeNo)
      await loadDetails()
    } catch {
      setError('하위 코드 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white w-11/12 max-w-2xl rounded shadow-lg overflow-auto max-h-[80vh]">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{pcode} 하위 코드 관리</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </header>

        <div className="p-4">
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <table className="w-full table-auto border-collapse mb-4">
              <thead>
                <tr>
                  <th className="border px-2 py-1">코드</th>
                  <th className="border px-2 py-1">코드명</th>
                  <th className="border px-2 py-1">추가정보</th>
                  <th className="border px-2 py-1">순번</th>
                  <th className="border px-2 py-1">액션</th>
                </tr>
              </thead>
              <tbody>
                {details.map(d =>
                  editingId === d.dcodeNo ? (
                    <tr key={d.dcodeNo}>
                      <td className="border px-2 py-1">
                        <input
                          name="dcode"
                          value={editingDetail.dcode}
                          onChange={handleEditChange}
                          className="w-full border px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          name="dcodeNm"
                          value={editingDetail.dcodeNm}
                          onChange={handleEditChange}
                          className="w-full border px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          name="dcodeExt"
                          value={editingDetail.dcodeExt}
                          onChange={handleEditChange}
                          className="w-full border px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          name="dcodeSeqNo"
                          type="number"
                          value={editingDetail.dcodeSeqNo}
                          onChange={handleEditChange}
                          className="w-16 border px-1 py-0.5"
                        />
                      </td>
                      <td className="border px-2 py-1 space-x-2">
                        <button
                          onClick={handleUpdate}
                          className="text-green-600 hover:underline"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:underline"
                        >
                          취소
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={d.dcodeNo}>
                      <td className="border px-2 py-1">{d.dcode}</td>
                      <td className="border px-2 py-1">{d.dcodeNm}</td>
                      <td className="border px-2 py-1">{d.dcodeExt}</td>
                      <td className="border px-2 py-1 text-center">{d.dcodeSeqNo}</td>
                      <td className="border px-2 py-1 space-x-2">
                        <button
                          onClick={() => startEdit(d)}
                          className="text-blue-600 hover:underline"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(d.dcodeNo)}
                          className="text-red-600 hover:underline"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}

          {/* 신규 하위 코드 등록 폼 */}
          <form onSubmit={handleCreate} className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <input
                name="dcode"
                placeholder="코드"
                value={newDetail.dcode}
                onChange={handleNewChange}
                className="border px-2 py-1"
                required
              />
              <input
                name="dcodeNm"
                placeholder="코드명"
                value={newDetail.dcodeNm}
                onChange={handleNewChange}
                className="border px-2 py-1"
                required
              />
              <input
                name="dcodeExt"
                placeholder="추가정보"
                value={newDetail.dcodeExt}
                onChange={handleNewChange}
                className="border px-2 py-1"
              />
              <input
                name="dcodeSeqNo"
                type="number"
                placeholder="순번"
                value={newDetail.dcodeSeqNo}
                onChange={handleNewChange}
                className="border px-2 py-1 w-20"
              />
            </div>
            <button
              type="submit"
              className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              등록
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CodeDetailList
