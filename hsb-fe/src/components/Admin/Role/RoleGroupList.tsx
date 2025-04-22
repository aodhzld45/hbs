import React, { useState, useEffect } from 'react';
import { RoleGroup } from '../../../types/Admin/RoleGroup'
import RoleGroupModal from './RoleGroupModal'; 
import {
  createRoleGroup,
  fetchRoleGroups,
  updateRoleGroup,
  softDeleteRoleGroup,
} from '../../../services/Admin/roleApi';

const RoleGroupList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleGroup | null>(null);
  const [roles, setRoles] = useState<RoleGroup[]>([]); 

  // 목록 불러오기
  const fetchRoles = async () => {
    try {
      const data = await fetchRoleGroups();
      setRoles(data);
    } catch (err) {
      console.error('권한 그룹 목록 불러오기 실패:', err);
    }
  };


  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null); // 새로 등록
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleGroup) => {
    setEditingRole(role); // 수정
    setIsModalOpen(true);
  };


  const handleSubmit = async (data: RoleGroup) => {
    try {
      if (data.id) {
        // 수정일 경우
        await updateRoleGroup(data.id, {
          name: data.name,
          description: data.description,
          useTf: data.useTf,
        });
      } else {
        // 등록일 경우
        await createRoleGroup({
          name: data.name,
          description: data.description,
          useTf: data.useTf,
        });
      }
  
      await fetchRoles(); // 저장 후 목록 새로고침
      setIsModalOpen(false); // 모달 닫기
    } catch (err) {
      console.error('권한 그룹 저장 실패:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">권한 그룹 목록</h3>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + 새 그룹 등록
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">이름</th>
            <th className="p-2 border">설명</th>
            <th className="p-2 border">사용여부</th>
            <th className="p-2 border">관리</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="p-2 border">{role.id}</td>
              <td className="p-2 border">{role.name}</td>
              <td className="p-2 border">{role.description}</td>
              <td className="p-2 border">{role.useTf === 'Y' ? '사용' : '미사용'}</td>
              <td className="p-2 border">
                <button
                  onClick={() => openEditModal(role)}
                  className="text-blue-600 hover:underline"
                >
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 등록/수정 모달 */}
      <RoleGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={async (id) => {
          await softDeleteRoleGroup(id);
          alert('삭제되었습니다.');
          fetchRoles();
        }}
        initialData={editingRole}
      />
    </div>
  );
};

export default RoleGroupList;
