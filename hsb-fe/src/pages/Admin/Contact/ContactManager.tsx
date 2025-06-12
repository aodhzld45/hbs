import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactItem } from '../../../types/Common/ContactItem'; 
import AdminLayout from '../../../components/Layout/AdminLayout';
import { fetchContactList } from '../../../services/Common/ContactApi';


const ContactManager = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [message, setMessage] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [contents, setContents] = useState<ContactItem[]>([]);

  const loadContacts = async (
    keyword: string,
    page: number,
    size: number
  ) => {
    try {
      const res = await fetchContactList(keyword, page, size);
      setContents(res.items);
      console.log(res);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setMessage(message);
    } catch (error) {
      console.error(error);
      alert(message);
    }
  }

  useEffect(() => {
    loadContacts(keyword, page, size);
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">문의 관리</h2>
      </div>
    </AdminLayout>

  );
};

export default ContactManager;


