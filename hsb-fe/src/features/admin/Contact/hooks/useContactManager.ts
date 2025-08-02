// features/Contact/hooks/useContactManager.ts
import { useState, useEffect } from 'react';
import { ContactItem } from '../types/ContactItem';
import { fetchContactList } from '../services/ContactApi';

export const useContactManager = () => {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [message, setMessage] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [contents, setContents] = useState<ContactItem[]>([]);

  const loadContacts = async (keyword: string, page: number, size: number) => {
    try {
      const res = await fetchContactList(keyword, page, size);
      setContents(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setMessage(res.message);
    } catch (error) {
      console.error(error);
      alert('문의 관리 목록 조회 실패');
    }
  };

  useEffect(() => {
    loadContacts(keyword, page, size);
  }, [keyword, page, size]);

  return {
    keyword,
    setKeyword,
    page,
    setPage,
    size,
    message,
    totalPages,
    totalCount,
    contents,
    loadContacts,
  };
};
